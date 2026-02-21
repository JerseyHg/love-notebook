import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.coupleId) {
      return NextResponse.json({ data: [] });
    }

    const wishes = await prisma.wish.findMany({
      where: { coupleId: user.coupleId },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: wishes });
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

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "心愿不能为空" },
        { status: 400 }
      );
    }

    const wish = await prisma.wish.create({
      data: {
        coupleId: user.coupleId,
        authorId: user.id,
        title,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: wish });
  } catch (error) {
    console.error("Wish create error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
