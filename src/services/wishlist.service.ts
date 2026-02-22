import { prisma } from "@/lib/server/db";

export async function getWishes(coupleId: string) {
  return prisma.wish.findMany({
    where: { coupleId },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
}

export async function createWish(
  coupleId: string,
  authorId: string,
  data: { title: string; description?: string | null }
) {
  return prisma.wish.create({
    data: {
      coupleId,
      authorId,
      title: data.title,
      description: data.description || null,
    },
  });
}

export async function toggleWish(wishId: string, coupleId: string) {
  const wish = await prisma.wish.findUnique({ where: { id: wishId } });
  if (!wish || wish.coupleId !== coupleId) {
    throw new Error("心愿不存在或无权操作");
  }

  return prisma.wish.update({
    where: { id: wishId },
    data: {
      completed: !wish.completed,
      completedAt: wish.completed ? null : new Date(),
    },
  });
}

export async function deleteWish(wishId: string, coupleId: string) {
  const wish = await prisma.wish.findUnique({ where: { id: wishId } });
  if (!wish || wish.coupleId !== coupleId) {
    throw new Error("心愿不存在或无权操作");
  }

  return prisma.wish.delete({ where: { id: wishId } });
}
