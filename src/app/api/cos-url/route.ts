import { withAuth, success, error } from "@/lib/server/api-handler";
import { batchSignUrls } from "@/lib/server/cos";

/**
 * POST /api/cos-url — 批量获取 COS 签名 URL
 *
 * 改造前：签名逻辑和 lib/cos.ts 重复
 * 改造后：统一使用 lib/server/cos.ts
 */
export const POST = withAuth(async (req) => {
  const { urls } = await req.json();

  if (!Array.isArray(urls)) {
    return error("Invalid request", 400);
  }

  const signedUrls = batchSignUrls(urls);
  return success({ signedUrls });
});
