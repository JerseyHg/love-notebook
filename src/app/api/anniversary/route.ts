import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.coupleId) {
      return NextResponse.json({ data: [] });
    }

    const anniversaries = await prisma.anniversary.findMany({
      where: { coupleId: user.coupleId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ data: anniversaries });
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

    const { title, date, icon, repeat } = await req.json();

    if (!title || !date) {
      return NextResponse.json(
        { error: "请填写名称和日期" },
        { status: 400 }
      );
    }

    const anniversary = await prisma.anniversary.create({
      data: {
        coupleId: user.coupleId,
        title,
        date: new Date(date),
        icon: icon || "❤️",
        repeat: repeat || "yearly",
      },
    });

    return NextResponse.json({ success: true, data: anniversary });
  } catch (error) {
    console.error("Anniversary create error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
