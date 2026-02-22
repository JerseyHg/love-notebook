import { prisma } from "@/lib/server/db";

export async function getTimelines(
  coupleId: string,
  options: { page?: number; limit?: number; hasLocation?: boolean } = {}
) {
  const { page = 1, limit = 20, hasLocation } = options;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { coupleId };
  if (hasLocation) {
    where.location = { not: null };
  }

  const [data, total] = await Promise.all([
    prisma.timeline.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit + 1, // 多取一条判断是否还有更多
    }),
    prisma.timeline.count({ where }),
  ]);

  const hasMore = data.length > limit;
  if (hasMore) data.pop();

  return { data, total, hasMore, page };
}

export async function createTimeline(
  coupleId: string,
  authorId: string,
  data: {
    content: string;
    photos?: string[];
    location?: { lat: number; lng: number; name: string } | null;
    mood?: string | null;
    date?: string;
  }
) {
  return prisma.timeline.create({
    data: {
      coupleId,
      authorId,
      content: data.content,
      photos: data.photos || [],
      location: data.location || undefined,
      mood: data.mood || null,
      date: new Date(data.date || Date.now()),
    },
  });
}

export async function updateTimeline(
  timelineId: string,
  coupleId: string,
  authorId: string,
  data: Partial<{
    content: string;
    photos: string[];
    location: { lat: number; lng: number; name: string } | null;
    mood: string | null;
    date: string;
  }>
) {
  const item = await prisma.timeline.findUnique({ where: { id: timelineId } });
  if (!item || item.coupleId !== coupleId) throw new Error("记录不存在");
  if (item.authorId !== authorId) throw new Error("无权编辑他人记录");

  return prisma.timeline.update({
    where: { id: timelineId },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  });
}

export async function deleteTimeline(
  timelineId: string,
  coupleId: string,
  authorId: string
) {
  const item = await prisma.timeline.findUnique({ where: { id: timelineId } });
  if (!item || item.coupleId !== coupleId) throw new Error("记录不存在");
  if (item.authorId !== authorId) throw new Error("无权删除他人记录");

  return prisma.timeline.delete({ where: { id: timelineId } });
}
