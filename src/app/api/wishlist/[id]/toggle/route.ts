import { NextRequest } from "next/server";
import { withCouple, success, error } from "@/lib/server/api-handler";
import * as wishService from "@/services/wishlist.service";

export const PATCH = withCouple(async (req: NextRequest, user) => {
  // 从 URL 提取动态路由参数: /api/wishlist/[id]/toggle
  const segments = new URL(req.url).pathname.split("/");
  const id = segments[segments.indexOf("wishlist") + 1];

  if (!id) {
    return error("缺少 ID", 400);
  }

  const updated = await wishService.toggleWish(id, user.coupleId);
  return success(updated);
});
