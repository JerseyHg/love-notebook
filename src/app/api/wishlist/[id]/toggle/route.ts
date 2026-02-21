import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const wish = await prisma.wish.findUnique({ where: { id } });

    if (!wish || wish.coupleId !== user.coupleId) {
      return NextResponse.json({ error: "心愿不存在" }, { status: 404 });
    }

    const updated = await prisma.wish.update({
      where: { id },
      data: {
        completed: !wish.completed,
        completedAt: !wish.completed ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Toggle wish error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
