/**
 * 이미지 게시글 API (TASK_WEB Step 3).
 * RULE 1.2(IDOR·403), 1.3(클라이언트 검증만 믿지 않기).
 */
import { apiClient } from './client';
import type { Page } from '@/types';
import type { ImagePostResponse } from '@/types/imagePost';

export interface ImagePostListParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface ImagePostNearbyParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}

export interface ImagePostCreateParams {
  title: string;
  content: string;
  image: File;
  latitude?: number;
  longitude?: number;
  pinId?: number;
}

export interface ImagePostUpdateParams {
  title: string;
  content: string;
  image?: File;
}

export const imagePostsApi = {
  list: (params?: ImagePostListParams) =>
    apiClient.get<Page<ImagePostResponse>>('/api/image-posts', { params }),

  nearby: (params: ImagePostNearbyParams) =>
    apiClient.get<Page<ImagePostResponse>>('/api/image-posts/nearby', { params }),

  get: (id: number) => apiClient.get<ImagePostResponse>(`/api/image-posts/${id}`),

  create: (params: ImagePostCreateParams) => {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('content', params.content);
    formData.append('image', params.image);
    if (params.latitude != null) formData.append('latitude', String(params.latitude));
    if (params.longitude != null) formData.append('longitude', String(params.longitude));
    if (params.pinId != null) formData.append('pinId', String(params.pinId));

    return apiClient.post<ImagePostResponse>('/api/image-posts', formData);
  },

  update: (id: number, params: ImagePostUpdateParams) => {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('content', params.content);
    if (params.image) formData.append('image', params.image);

    return apiClient.put<ImagePostResponse>(`/api/image-posts/${id}`, formData);
  },

  delete: (id: number) => apiClient.delete(`/api/image-posts/${id}`),
};
