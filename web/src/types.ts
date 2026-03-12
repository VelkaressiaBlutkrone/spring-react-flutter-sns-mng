export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  profilePic?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface Post {
  id: number;
  userId: number;
  userName: string;
  content: string;
  imageUrl: string;
  category?: string;
  lat: number;
  lng: number;
  createdAt: string;
  user?: User;
  likesCount?: number;
  isLiked?: boolean;
}

export interface Pin {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  description?: string;
  category?: string;
  lat: number;
  lng: number;
  postId?: number;
}

export interface Route {
  id: number;
  userId: number;
  name: string;
  points: string; // JSON string
  path: string; // JSON string
  distance: number;
  duration: number;
  transportMode: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'follow' | 'like' | 'mention';
  fromUserId: number;
  fromUserName: string;
  fromUserProfilePic?: string;
  postId?: number;
  isRead: boolean;
  createdAt: string;
}
