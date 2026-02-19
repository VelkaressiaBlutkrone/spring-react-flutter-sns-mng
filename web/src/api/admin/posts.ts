/**
 * 관리자 게시글 API (TASK_WEB Step 7).
 * GET/PUT/DELETE /api/admin/posts, PATCH /{id}/notice. ROLE_ADMIN 필수.
 * RULE 1.2: 최소 권한.
 */
import { apiClient } from '../client';
import type { Page } from '@/types';
import type { PostResponse, PostUpdateRequest } from '@/types/post';

export interface AdminPostListParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const adminPostsApi = {
  list: (params?: AdminPostListParams) =>
    apiClient.get<Page<PostResponse>>('/api/admin/posts', { params }),

  get: (id: number) => apiClient.get<PostResponse>(`/api/admin/posts/${id}`),

  update: (id: number, data: PostUpdateRequest) =>
    apiClient.put<PostResponse>(`/api/admin/posts/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/admin/posts/${id}`),

  toggleNotice: (id: number, notice: boolean) =>
    apiClient.patch<PostResponse>(`/api/admin/posts/${id}/notice`, null, {
      params: { notice },
    }),
};
