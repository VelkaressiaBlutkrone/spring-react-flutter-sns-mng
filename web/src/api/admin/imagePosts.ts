/**
 * 관리자 이미지 게시글 API (TASK_WEB Step 7).
 * GET/PUT/DELETE /api/admin/image-posts, PATCH /{id}/notice. ROLE_ADMIN 필수.
 * RULE 1.2: 최소 권한.
 */
import { apiClient } from '../client';
import type { Page } from '@/types';
import type { ImagePostResponse } from '@/types/imagePost';

export interface AdminImagePostListParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface AdminImagePostUpdateParams {
  title: string;
  content: string;
  image?: File;
}

export const adminImagePostsApi = {
  list: (params?: AdminImagePostListParams) =>
    apiClient.get<Page<ImagePostResponse>>('/api/admin/image-posts', { params }),

  get: (id: number) => apiClient.get<ImagePostResponse>(`/api/admin/image-posts/${id}`),

  update: (id: number, params: AdminImagePostUpdateParams) => {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('content', params.content);
    if (params.image) formData.append('image', params.image);
    return apiClient.put<ImagePostResponse>(`/api/admin/image-posts/${id}`, formData);
  },

  delete: (id: number) => apiClient.delete(`/api/admin/image-posts/${id}`),

  toggleNotice: (id: number, notice: boolean) =>
    apiClient.patch<ImagePostResponse>(`/api/admin/image-posts/${id}/notice`, null, {
      params: { notice },
    }),
};
