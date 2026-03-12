/**
 * Axios 인스턴스 — Spring Boot 백엔드 연동.
 * VITE_API_BASE_URL 환경변수 또는 Vite proxy 사용.
 * 401 시 refresh 토큰으로 재시도, 실패 시 로그아웃.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const baseURL =
  import.meta.env.VITE_API_BASE_URL != null && String(import.meta.env.VITE_API_BASE_URL).trim() !== ''
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
    : '';

const api = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;

    if (status === 401 && !originalRequest._retry) {
      const url = typeof originalRequest.url === 'string' ? originalRequest.url : '';
      const isRefresh = url.includes('/auth/refresh');
      const isLogin = url.includes('/auth/login');
      if (isRefresh || isLogin) {
        if (isRefresh) {
          useAuthStore.getState().logout();
        }
        throw err;
      }

      originalRequest._retry = true;
      try {
        const refreshBase = baseURL ? `${baseURL}/api` : '/api';
        const res = await axios.post<{ accessToken: string }>(
          `${refreshBase}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = res.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        throw err;
      }
    }

    throw err;
  },
);

export default api;
