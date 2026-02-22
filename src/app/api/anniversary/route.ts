import { withCouple, success } from "@/lib/server/api-handler";
import { parseBody } from "@/lib/server/api-handler";
import { createAnniversarySchema } from "@/lib/validations";
import * as anniversaryService from "@/services/anniversary.service";

export const GET = withCouple(async (_req, user) => {
  const items = await anniversaryService.getAnniversaries(user.coupleId);
  return success(items);
});

export const POST = withCouple(async (req, user) => {
  const data = await parseBody(req, createAnniversarySchema);
  const item = await anniversaryService.createAnniversary(user.coupleId, data);
  return success(item);
});
