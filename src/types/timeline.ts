export interface TimelineAuthor {
  id: string;
  nickname: string;
  avatar: string | null;
}

export interface TimelineItem {
  id: string;
  coupleId: string;
  authorId: string;
  author?: TimelineAuthor; // ✅ 新增：来自 Prisma include
  content: string;
  photos: string[];
  location: { lat: number; lng: number; name: string } | null;
  mood: string | null;
  date: string;
  createdAt: string;
}
