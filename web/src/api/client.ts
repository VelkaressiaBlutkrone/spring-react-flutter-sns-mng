/**
 * Axios 인스턴스 (TASK_WEB Step 1, 2).
 * 요청 시 Authorization 헤더, 401 시 Refresh 시도 후 재요청 (RULE 6.1~6.5).
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL =
  import.meta.env.VITE_API_BASE_URL != null && String(import.meta.env.VITE_API_BASE_URL).trim() !== ''
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
    : '';

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;

    if (status === 401 && !originalRequest._retry) {
      const url = typeof originalRequest.url === 'string' ? originalRequest.url : '';
      const isRefresh = url.includes('/api/auth/refresh');
      const isLogin = url.includes('/api/auth/login');
      // 로그인/가입 실패 시 Refresh 시도하지 않음 (세션 없음)
      if (isRefresh || isLogin) {
        if (isRefresh) {
          useAuthStore.getState().clearAuth();
          redirectToLogin();
        }
        throw err;
      }

      originalRequest._retry = true;
      try {
        const res = await axios.post<{ accessToken: string }>(
          `${baseURL || ''}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        redirectToLogin();
        throw err;
      }
    }

    // 403: 권한 부족 — 인증은 유효하나 해당 리소스에 접근 불가 (RULE 1.2)
    if (status === 403) {
      useAuthStore.getState().clearAuth();
      if (globalThis.window !== undefined && globalThis.window.location.pathname !== '/') {
        globalThis.window.location.href = '/';
      }
    }

    throw err;
  }
);

function redirectToLogin() {
  if (globalThis.window !== undefined && globalThis.window.location.pathname !== '/login') {
    globalThis.window.location.href = '/login';
  }
}
