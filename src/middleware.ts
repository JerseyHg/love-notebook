import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");

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
      await jwtVerify(token, secret);
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
    await jwtVerify(token, secret);
    // 已登录用户访问 login/register 页面时，重定向到主页
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/timeline", req.url));
    }
    return NextResponse.next();
  } catch {
    // Token 无效，重定向到登录
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
