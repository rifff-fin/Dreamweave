// Purpose: TypeScript type definitions for all NOCTIS data models.

export type PostCategory = 'dream' | 'myth' | 'paranormal';
export type PostVisibility = 'public' | 'friends' | 'anonymous';
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  joinDate: Date;
  streakCount: number;
  badges: string[];
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  category: PostCategory;
  tags: string[];
  city: string;
  area: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  locationType?: string;
  division?: string;
  userId?: string;
  visibility: PostVisibility;
  isLucid: boolean;
  isRecurring: boolean;
  timestamp: Date;
  authorId?: string;
  authorName?: string;
}

export interface Reaction {
  _id: string;
  userId: string;
  postId: string;
  reactionType: string;
  timestamp: Date;
}

export interface FriendRequest {
  _id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  requestDate: Date;
}

export interface Badge {
  _id: string;
  badgeName: string;
  description: string;
  criteria: string;
}

export interface SharedDream {
  _id: string;
  theme: string;
  city: string;
  area: string;
  userCount: number;
  detectedTime: Date;
}
