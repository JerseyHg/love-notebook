import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateInviteCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { mode, togetherDate, inviteCode } = await req.json();

    if (user.coupleId) {
      return NextResponse.json(
        { error: "你已经配对了" },
        { status: 400 }
      );
    }

    if (mode === "create") {
      if (!togetherDate) {
        return NextResponse.json(
          { error: "请选择在一起的日期" },
          { status: 400 }
        );
      }

      const code = generateInviteCode();
      const couple = await prisma.couple.create({
        data: {
          inviteCode: code,
          togetherDate: new Date(togetherDate),
          users: { connect: { id: user.id } },
        },
      });

      return NextResponse.json({
        success: true,
        inviteCode: couple.inviteCode,
        coupleId: couple.id,
      });
    }

    if (mode === "join") {
      if (!inviteCode) {
        return NextResponse.json(
          { error: "请输入邀请码" },
          { status: 400 }
        );
      }

      const couple = await prisma.couple.findUnique({
        where: { inviteCode },
        include: { users: true },
      });

      if (!couple) {
        return NextResponse.json(
          { error: "邀请码无效" },
          { status: 404 }
        );
      }

      if (couple.users.length >= 2) {
        return NextResponse.json(
          { error: "该空间已满" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { coupleId: couple.id },
      });

      return NextResponse.json({ success: true, coupleId: couple.id });
    }

    return NextResponse.json({ error: "无效的操作" }, { status: 400 });
  } catch (error) {
    console.error("Pair error:", error);
    return NextResponse.json(
      { error: "配对失败，请重试" },
      { status: 500 }
    );
  }
}
