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
