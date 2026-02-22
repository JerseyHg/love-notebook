import { withCouple, success, error, parseBody } from "@/lib/server/api-handler";
import { createTimelineSchema, updateTimelineSchema } from "@/lib/validations";
import * as timelineService from "@/services/timeline.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/timeline — 获取时间轴列表（分页）
 *
 * 支持参数：
 * - page: 页码（默认 1）
 * - limit: 每页条数（默认 20，最大 50；hasLocation 模式最大 200）
 * - hasLocation: 只返回有位置信息的记录（足迹地图用）
 */
export const GET = withCouple(async (req, user) => {
  const url = new URL(req.url);
  const hasLocation = url.searchParams.get("hasLocation") === "true";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  // 足迹地图需要一次拿更多数据
  const maxLimit = hasLocation ? 200 : 50;
  const limit = Math.min(maxLimit, parseInt(url.searchParams.get("limit") || "20"));

  const result = await timelineService.getTimelines(user.coupleId, {
    page,
    limit,
    hasLocation,
  });

  // 平铺返回，保持前端兼容
  return NextResponse.json({
    data: result.data,
    hasMore: result.hasMore,
    total: result.total,
  });
});

/**
 * POST /api/timeline — 创建时间轴记录
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
