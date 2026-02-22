import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "./auth";
import { ZodError, ZodSchema } from "zod";

type AuthUser = Awaited<ReturnType<typeof requireAuth>>;

// ========================================
// 统一 API 响应格式
// ========================================

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ========================================
// 需要认证的 API 路由包装器
// ========================================

type AuthHandler = (
  req: NextRequest,
  user: AuthUser
) => Promise<NextResponse>;

/**
 * 包装需要认证的 API 路由
 *
 * 用法：
 * ```ts
 * export const GET = withAuth(async (req, user) => {
 *   const data = await prisma.diary.findMany({ where: { authorId: user.id } });
 *   return success(data);
 * });
 * ```
 */
export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAuth();
      return await handler(req, user);
    } catch (err) {
      return handleError(err);
    }
  };
}

// ========================================
// 需要认证 + 需要配对的 API 路由包装器
// ========================================

type CoupleAuthHandler = (
  req: NextRequest,
  user: AuthUser & { coupleId: string }
) => Promise<NextResponse>;

/**
 * 包装需要认证 + 已配对的 API 路由
 */
export function withCouple(handler: CoupleAuthHandler) {
  return withAuth(async (req, user) => {
    if (!user.coupleId) {
      return error("请先完成情侣配对", 400);
    }
    return handler(req, user as AuthUser & { coupleId: string });
  });
}

// ========================================
// 请求体解析 + Zod 验证
// ========================================

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const raw = await req.json();
  return schema.parse(raw);
}

// ========================================
// 统一错误处理
// ========================================

function handleError(err: unknown): NextResponse {
  // 认证失败
  if (err instanceof AuthError) {
    return error("未登录，请先登录", 401);
  }

  // Zod 验证失败
  if (err instanceof ZodError) {
    const firstError = err.issues[0];
    const message = firstError?.message || "输入数据格式不正确";
    return error(message, 400);
  }

  // 其他错误
  console.error("API Error:", err);
  return error("服务器错误，请稍后重试", 500);
}
