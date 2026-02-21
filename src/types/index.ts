export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  coupleId: string | null;
}

export interface Couple {
  id: string;
  inviteCode: string;
  togetherDate: string;
  users: User[];
}

export interface TimelineItem {
  id: string;
  coupleId: string;
  authorId: string;
  content: string;
  photos: string[];
  location: { lat: number; lng: number; name: string } | null;
  mood: string | null;
  date: string;
  createdAt: string;
}

export interface DiaryItem {
  id: string;
  authorId: string;
  author: User;
  title: string;
  content: string;
  mood: string | null;
  weather: string | null;
  isPrivate: boolean;
  date: string;
  createdAt: string;
}

export interface WishItem {
  id: string;
  coupleId: string;
  authorId: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  completedPhoto: string | null;
  createdAt: string;
}

export interface AnniversaryItem {
  id: string;
  coupleId: string;
  title: string;
  date: string;
  icon: string;
  repeat: "yearly" | "monthly" | "once";
  notify: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
