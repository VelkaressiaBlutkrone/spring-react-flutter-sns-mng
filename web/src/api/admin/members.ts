/**
 * 관리자 회원 API (TASK_WEB Step 7).
 * GET/POST/PUT/DELETE /api/admin/members. ROLE_ADMIN 필수.
 * RULE 1.2: 최소 권한.
 */
import { apiClient } from '../client';
import type { Page } from '@/types';
import type { MemberResponse } from '../members';

export interface AdminMemberCreateRequest {
  email: string;
  password: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
}

export interface AdminMemberUpdateRequest {
  nickname: string;
  role: 'USER' | 'ADMIN';
}

export interface AdminMemberListParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const adminMembersApi = {
  list: (params?: AdminMemberListParams) =>
    apiClient.get<Page<MemberResponse>>('/api/admin/members', { params }),

  get: (id: number) => apiClient.get<MemberResponse>(`/api/admin/members/${id}`),

  create: (data: AdminMemberCreateRequest) =>
    apiClient.post<MemberResponse>('/api/admin/members', data),

  update: (id: number, data: AdminMemberUpdateRequest) =>
    apiClient.put<MemberResponse>(`/api/admin/members/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/admin/members/${id}`),
};
