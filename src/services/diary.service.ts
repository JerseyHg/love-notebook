import { prisma } from "@/lib/server/db";

/**
 * 获取用户可见的日记列表
 * - 自己的所有日记
 * - 对方的公开日记（如果已配对）
 *
 * ✅ 改进：直接用 Diary.coupleId 查询，不再 join User 表
 */
export async function getDiaries(userId: string, coupleId: string | null) {
  const where = coupleId
    ? {
        OR: [
          { authorId: userId },
          { coupleId, isPrivate: false },
        ],
      }
    : { authorId: userId };

  return prisma.diary.findMany({
    where,
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });
}

/**
 * 创建日记
 * ✅ 改进：创建时写入 coupleId
 */
export async function createDiary(
  authorId: string,
  coupleId: string | null,
  data: {
    title?: string;
    content: string;
    mood?: string | null;
    weather?: string | null;
    isPrivate?: boolean;
    date?: string;
  }
) {
  return prisma.diary.create({
    data: {
      authorId,
      coupleId,
      title: data.title || "",
      content: data.content,
      mood: data.mood || null,
      weather: data.weather || null,
      isPrivate: data.isPrivate || false,
      date: new Date(data.date || Date.now()),
    },
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true },
      },
    },
  });
}

/**
 * 删除日记（仅限作者本人）
 */
export async function deleteDiary(diaryId: string, authorId: string) {
  const diary = await prisma.diary.findUnique({ where: { id: diaryId } });

  if (!diary) throw new Error("日记不存在");
  if (diary.authorId !== authorId) throw new Error("无权删除他人日记");

  return prisma.diary.delete({ where: { id: diaryId } });
}
