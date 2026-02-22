import { withAuth, success, error } from "@/lib/server/api-handler";
import { parseBody } from "@/lib/server/api-handler";
import { createDiarySchema } from "@/lib/validations";
import * as diaryService from "@/services/diary.service";

/**
 * GET /api/diary — 获取日记列表
 *
 * 对比改造前：
 * - 不再手写 try/catch，由 withAuth 统一处理
 * - 不再手动调用 requireAuth()
 * - 统一响应格式 { success, data }
 */
export const GET = withAuth(async (_req, user) => {
  const diaries = await diaryService.getDiaries(user.id, user.coupleId);
  return success(diaries);
});

/**
 * POST /api/diary — 创建日记
 *
 * 对比改造前：
 * - 使用 Zod schema 验证请求体，验证失败自动返回友好错误信息
 * - 业务逻辑委托给 service 层
 */
export const POST = withAuth(async (req, user) => {
  const data = await parseBody(req, createDiarySchema);
  const diary = await diaryService.createDiary(user.id, data);
  return success(diary);
});
