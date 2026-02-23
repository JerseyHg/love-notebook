import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ✅ 安全修复：与 auth.ts 保持一致，不再使用空字符串 fallback
function getSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET 环境变量未配置");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

// 不需要登录的路径
const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 静态资源 & 公开路径跳过
  if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/uploads") ||
      pathname.startsWith("/icons") ||
      pathname.startsWith("/.well-known") ||
      pathname === "/manifest.json" ||
      pathname === "/sw.js" ||
      isPublicPath(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  // API 路由：未认证返回 401
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }
  }

  // 页面路由：未认证重定向到登录页
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, getSecret());
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/timeline", req.url));
    }
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
