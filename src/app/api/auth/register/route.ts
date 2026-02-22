import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import { signToken, getAuthCookieOptions } from "@/lib/server/auth";
import { parseBody } from "@/lib/server/api-handler";
import { registerSchema } from "@/lib/validations";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // ✅ Zod 验证（email 格式、密码长度、昵称非空）
    const { email, password, nickname } = await parseBody(req, registerSchema);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nickname },
    });

    const token = await signToken({ userId: user.id, email: user.email });

    const cookieStore = await cookies();
    // 🔴 安全修复：使用动态 cookie 配置
    cookieStore.set("token", token, getAuthCookieOptions());

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败，请重试" }, { status: 500 });
  }
}
