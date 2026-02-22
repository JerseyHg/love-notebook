import { withAuth, success } from "@/lib/server/api-handler";
import { parseBody } from "@/lib/server/api-handler";
import { createDiarySchema } from "@/lib/validations";
import * as diaryService from "@/services/diary.service";

/**
 * GET /api/diary — 获取日记列表
 */
export const GET = withAuth(async (_req, user) => {
  const diaries = await diaryService.getDiaries(user.id, user.coupleId);
  return success(diaries);
});

/**
 * POST /api/diary — 创建日记
 * ✅ 改进：传入 coupleId
 */
export const POST = withAuth(async (req, user) => {
  const data = await parseBody(req, createDiarySchema);
  const diary = await diaryService.createDiary(user.id, user.coupleId, data);
  return success(diary);
});
