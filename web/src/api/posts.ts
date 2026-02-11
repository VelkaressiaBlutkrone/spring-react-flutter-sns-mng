/**
 * 게시글 API (TASK_WEB Step 3).
 * RULE 1.2(IDOR·403), 1.3(클라이언트 검증만 믿지 않기).
 */
import { apiClient } from './client';
import type { Page } from '@/types';
import type { PostCreateRequest, PostResponse, PostUpdateRequest } from '@/types/post';

export interface PostListParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const postsApi = {
  list: (params?: PostListParams) =>
    apiClient.get<Page<PostResponse>>('/api/posts', { params }),

  get: (id: number) => apiClient.get<PostResponse>(`/api/posts/${id}`),

  create: (data: PostCreateRequest) =>
    apiClient.post<PostResponse>('/api/posts', data),

  update: (id: number, data: PostUpdateRequest) =>
    apiClient.put<PostResponse>(`/api/posts/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/posts/${id}`),
};
