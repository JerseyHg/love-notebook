import { NextRequest } from "next/server";
import { withCouple, success, error, parseBody } from "@/lib/server/api-handler";
import { createTimelineSchema, updateTimelineSchema } from "@/lib/validations";
import * as timelineService from "@/services/timeline.service";

/**
 * GET /api/timeline — 获取时间轴列表（分页）
 *
 * 改造点：
 * - withCouple 自动处理认证 + 配对检查（未配对返回错误）
 * - 统一响应格式 { success, data }
 * - 业务逻辑委托给 service 层
 */
export const GET = withCouple(async (req, user) => {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));

  const result = await timelineService.getTimelines(user.coupleId, { page, limit });

  return success(result);
});

/**
 * POST /api/timeline — 创建时间轴记录
 *
 * 改造点：
 * - Zod schema 自动验证请求体（content 非空、photos 格式等）
 * - 验证失败由 withCouple 内部的 handleError 统一返回友好错误信息
 */
export const POST = withCouple(async (req, user) => {
  const data = await parseBody(req, createTimelineSchema);
  const timeline = await timelineService.createTimeline(
    user.coupleId,
    user.id,
    data
  );

  return success(timeline);
});

/**
 * PUT /api/timeline — 更新时间轴记录
 *
 * 改造点：
 * - 使用 updateTimelineSchema（partial 验证）
 * - 权限校验（只能编辑自己的）在 service 层处理
 */
export const PUT = withCouple(async (req, user) => {
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id) {
    return error("缺少 ID", 400);
  }

  const data = updateTimelineSchema.parse(rest);
  const updated = await timelineService.updateTimeline(
    id,
    user.coupleId,
    user.id,
    data
  );

  return success(updated);
});

/**
 * DELETE /api/timeline — 删除时间轴记录
 *
 * 改造点：
 * - 权限校验在 service 层（只能删除自己的）
 * - service 抛出的错误由 withCouple 统一捕获返回
 */
export const DELETE = withCouple(async (req, user) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return error("缺少 ID", 400);
  }

  await timelineService.deleteTimeline(id, user.coupleId, user.id);

  return success(null);
});
