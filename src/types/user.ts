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
