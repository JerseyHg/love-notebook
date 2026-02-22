import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import { signToken, getAuthCookieOptions } from "@/lib/server/auth";
import { parseBody } from "@/lib/server/api-handler";
import { loginSchema } from "@/lib/validations";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // ✅ Zod 验证
    const { email, password } = await parseBody(req, loginSchema);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email });

    const cookieStore = await cookies();
    // 🔴 安全修复：使用动态 cookie 配置
    cookieStore.set("token", token, getAuthCookieOptions());

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        coupleId: user.coupleId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 });
  }
}
