import { prisma } from "@/lib/server/db";

export async function getAnniversaries(coupleId: string) {
  return prisma.anniversary.findMany({
    where: { coupleId },
    orderBy: { date: "asc" },
  });
}

export async function createAnniversary(
  coupleId: string,
  data: {
    title: string;
    date: string;
    icon?: string;
    repeat?: string;
    notify?: boolean;
  }
) {
  return prisma.anniversary.create({
    data: {
      coupleId,
      title: data.title,
      date: new Date(data.date),
      icon: data.icon || "❤️",
      repeat: data.repeat || "yearly",
      notify: data.notify ?? true,
    },
  });
}

export async function deleteAnniversary(id: string, coupleId: string) {
  const item = await prisma.anniversary.findUnique({ where: { id } });
  if (!item || item.coupleId !== coupleId) throw new Error("纪念日不存在");

  return prisma.anniversary.delete({ where: { id } });
}
