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
