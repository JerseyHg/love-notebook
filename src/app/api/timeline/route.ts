import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.coupleId) {
      return NextResponse.json({ data: [], hasMore: false });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const [timelines, total] = await Promise.all([
      prisma.timeline.findMany({
        where: { coupleId: user.coupleId },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.timeline.count({
        where: { coupleId: user.coupleId },
      }),
    ]);

    // 确保 photos / location 是正确的类型（MySQL Json 字段有时返回字符串）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = timelines.map((t: any) => ({
      ...t,
      photos: typeof t.photos === "string" ? JSON.parse(t.photos) : (t.photos || []),
      location: typeof t.location === "string" ? JSON.parse(t.location) : t.location,
    }));

    return NextResponse.json({
      data,
      hasMore: skip + timelines.length < total,
      total,
    });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.coupleId) {
      return NextResponse.json(
        { error: "请先完成情侣配对" },
        { status: 400 }
      );
    }

    const { content, photos, location, mood, date } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      );
    }

    const timeline = await prisma.timeline.create({
      data: {
        coupleId: user.coupleId,
        authorId: user.id,
        content,
        photos: photos || [],
        location: location || null,
        mood: mood || null,
        date: new Date(date || Date.now()),
      },
    });

    const safeTimeline = {
      ...timeline,
      photos: typeof timeline.photos === "string" ? JSON.parse(timeline.photos) : (timeline.photos || []),
      location: typeof timeline.location === "string" ? JSON.parse(timeline.location) : timeline.location,
    };
    return NextResponse.json({ success: true, data: safeTimeline });
  } catch (error) {
    console.error("Timeline create error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, content, photos, location, mood, date } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
    }

    const existing = await prisma.timeline.findUnique({ where: { id } });

    if (!existing || existing.coupleId !== user.coupleId) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json({ error: "只能编辑自己的记录" }, { status: 403 });
    }

    const updated = await prisma.timeline.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(photos !== undefined && { photos }),
        ...(location !== undefined && { location }),
        ...(mood !== undefined && { mood }),
        ...(date !== undefined && { date: new Date(date) }),
      },
    });

    const safeUpdated = {
      ...updated,
      photos: typeof updated.photos === "string" ? JSON.parse(updated.photos) : (updated.photos || []),
      location: typeof updated.location === "string" ? JSON.parse(updated.location) : updated.location,
    };
    return NextResponse.json({ success: true, data: safeUpdated });
  } catch (error) {
    console.error("Timeline update error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
    }

    const existing = await prisma.timeline.findUnique({ where: { id } });

    if (!existing || existing.coupleId !== user.coupleId) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json({ error: "只能删除自己的记录" }, { status: 403 });
    }

    await prisma.timeline.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Timeline delete error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
