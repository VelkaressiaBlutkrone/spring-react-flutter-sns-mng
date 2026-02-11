/**
 * 이미지 게시글(ImagePost) 관련 타입.
 */

export interface ImagePostResponse {
  id: number;
  authorId: number;
  authorNickname: string;
  title: string;
  content: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
  pinId: number | null;
  notice: boolean;
  createdAt: string;
  updatedAt: string;
}
