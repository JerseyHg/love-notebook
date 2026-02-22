import { withCouple, success } from "@/lib/server/api-handler";
import { parseBody } from "@/lib/server/api-handler";
import { createWishSchema } from "@/lib/validations";
import * as wishService from "@/services/wishlist.service";

/**
 * GET /api/wishlist
 */
export const GET = withCouple(async (_req, user) => {
  const wishes = await wishService.getWishes(user.coupleId);
  return success(wishes);
});

/**
 * POST /api/wishlist
 */
export const POST = withCouple(async (req, user) => {
  const data = await parseBody(req, createWishSchema);
  const wish = await wishService.createWish(user.coupleId, user.id, data);
  return success(wish);
});
