import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    // 获取自己的日记 + 对方的公开日记
    const where = user.coupleId
      ? {
          OR: [
            { authorId: user.id },
            {
              author: { coupleId: user.coupleId },
              isPrivate: false,
            },
          ],
        }
      : { authorId: user.id };

    const diaries = await prisma.diary.findMany({
      where,
      include: {
        author: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: diaries });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, content, mood, weather, isPrivate, date } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      );
    }

    const diary = await prisma.diary.create({
      data: {
        authorId: user.id,
        title: title || "",
        content,
        mood: mood || null,
        weather: weather || null,
        isPrivate: isPrivate || false,
        date: new Date(date || Date.now()),
      },
    });

    return NextResponse.json({ success: true, data: diary });
  } catch (error) {
    console.error("Diary create error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
