/**
 * Pin API (TASK_WEB Step 4, Step 5).
 * GET /api/pins/nearby, /api/pins/{id}/posts, /api/pins/{id}/image-posts.
 * Pin CRUD: list, create (로그인 필수).
 * RULE 1.3(클라이언트 검증만 믿지 않기).
 */
import { apiClient } from './client';
import type { Page } from '@/types';
import type { PinResponse } from '@/types/pin';
import type { PostResponse } from '@/types/post';
import type { ImagePostResponse } from '@/types/imagePost';

export interface PinNearbyParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}

export interface PinCreateRequest {
  latitude: number;
  longitude: number;
  description?: string;
}

export const pinsApi = {
  /** 반경 내 Pin 조회 (인증 불필요) */
  nearby: (params: PinNearbyParams) =>
    apiClient.get<Page<PinResponse>>('/api/pins/nearby', { params }),

  /** Pin별 게시글 목록 (인증 불필요) */
  getPosts: (pinId: number, params?: { page?: number; size?: number }) =>
    apiClient.get<Page<PostResponse>>(`/api/pins/${pinId}/posts`, { params }),

  /** Pin별 이미지 게시글 목록 (인증 불필요) */
  getImagePosts: (pinId: number, params?: { page?: number; size?: number }) =>
    apiClient.get<Page<ImagePostResponse>>(`/api/pins/${pinId}/image-posts`, { params }),

  /** 내 Pin 목록 (로그인 필수) */
  list: (params?: { page?: number; size?: number }) =>
    apiClient.get<Page<PinResponse>>('/api/pins', { params }),

  /** Pin 생성 (로그인 필수) */
  create: (data: PinCreateRequest) =>
    apiClient.post<PinResponse>('/api/pins', data),
};
