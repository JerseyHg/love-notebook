import { withAuth, success, error, parseBody } from "@/lib/server/api-handler";
import { prisma } from "@/lib/server/db";
import { pairSchema } from "@/lib/validations";
import { generateInviteCode } from "@/lib/utils";

export const POST = withAuth(async (req, user) => {
  if (user.coupleId) {
    return error("你已经配对了", 400);
  }

  const body = await parseBody(req, pairSchema);

  if (body.mode === "create") {
    const code = generateInviteCode();
    const couple = await prisma.couple.create({
      data: {
        inviteCode: code,
        togetherDate: new Date(body.togetherDate),
        users: { connect: { id: user.id } },
      },
    });

    return success({
      inviteCode: couple.inviteCode,
      coupleId: couple.id,
    });
  }

  // mode === "join"
  const couple = await prisma.couple.findUnique({
    where: { inviteCode: body.inviteCode },
    include: { users: true },
  });

  if (!couple) {
    return error("邀请码无效", 404);
  }

  if (couple.users.length >= 2) {
    return error("该空间已满", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { coupleId: couple.id },
  });

  return success({ coupleId: couple.id });
});
