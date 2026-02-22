export type { User, Couple } from "./user";
export type { TimelineItem } from "./timeline";
export type { DiaryItem } from "./diary";
export type { WishItem } from "./wishlist";
export type { AnniversaryItem } from "./anniversary";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
