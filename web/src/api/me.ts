/**
 * 마이페이지 API (TASK_WEB Step 6).
 * GET /api/me/posts, /api/me/image-posts, /api/me/pins, PUT /api/me.
 * RULE 1.2: 리소스 소유권 검증 (로그인 사용자 전용).
 */
import { apiClient } from './client';
import type { Page } from '@/types';
import type { PostResponse } from '@/types/post';
import type { ImagePostResponse } from '@/types/imagePost';
import type { PinResponse } from '@/types/pin';
import type { MemberResponse } from './members';

export interface MeListParams {
  page?: number;
  size?: number;
}

export interface MemberUpdateRequest {
  nickname: string;
}

export const meApi = {
  /** 내 게시글 목록 */
  getMyPosts: (params?: MeListParams) =>
    apiClient.get<Page<PostResponse>>('/api/me/posts', { params }),

  /** 내 이미지 게시글 목록 */
  getMyImagePosts: (params?: MeListParams) =>
    apiClient.get<Page<ImagePostResponse>>('/api/me/image-posts', { params }),

  /** 내 Pin 목록 */
  getMyPins: (params?: MeListParams) =>
    apiClient.get<Page<PinResponse>>('/api/me/pins', { params }),

  /** 개인정보 수정 (닉네임 등) */
  updateMe: (data: MemberUpdateRequest) =>
    apiClient.put<MemberResponse>('/api/me', data),
};
