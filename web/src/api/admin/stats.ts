/**
 * 관리자 통계 API (TASK_WEB Step 8).
 * GET /api/admin/stats/signup, /login, /posts. ROLE_ADMIN 필수.
 * RULE 2.3: 읽기 전용, RULE 1.2: 관리자만.
 */
import { apiClient } from '../client';

export interface SignupStatsResponse {
  totalCount: number;
}

export interface LoginStatsResponse {
  loginCount: number;
  activeUsers: number;
}

export interface PostStatsItem {
  periodLabel: string;
  postCount: number;
  imagePostCount: number;
}

export interface PostStatsResponse {
  unit: string;
  items: PostStatsItem[];
}

export type StatsUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface StatsParams {
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  unit?: StatsUnit;
}

export const adminStatsApi = {
  signup: (params: Pick<StatsParams, 'startDate' | 'endDate'>) =>
    apiClient.get<SignupStatsResponse>('/api/admin/stats/signup', { params }),

  login: (params: Pick<StatsParams, 'startDate' | 'endDate'>) =>
    apiClient.get<LoginStatsResponse>('/api/admin/stats/login', { params }),

  posts: (params: StatsParams) =>
    apiClient.get<PostStatsResponse>('/api/admin/stats/posts', {
      params: { ...params, unit: params.unit ?? 'day' },
    }),
};
