/**
 * 게시글(Post) 관련 타입.
 */

export interface PostResponse {
  id: number;
  authorId: number;
  authorNickname: string;
  title: string;
  content: string;
  latitude: number | null;
  longitude: number | null;
  pinId: number | null;
  notice: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostCreateRequest {
  title: string;
  content: string;
  latitude?: number;
  longitude?: number;
  pinId?: number;
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  latitude?: number | null;
  longitude?: number | null;
  pinId?: number | null;
}
