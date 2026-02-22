import type { User } from "./user";

export interface DiaryItem {
  id: string;
  authorId: string;
  author: User;
  coupleId: string | null; // ✅ 新增
  title: string;
  content: string;
  mood: string | null;
  weather: string | null;
  isPrivate: boolean;
  date: string;
  createdAt: string;
}
