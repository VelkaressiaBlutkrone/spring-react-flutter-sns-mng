/**
 * 관리자 전용 라우트 (TASK_WEB Step 7).
 * ROLE_ADMIN 검증, 미권한 시 403·리다이렉트.
 * RULE 1.2: 최소 권한, 관리자만 접근.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface AdminRouteProps {
  readonly children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" state={{ message: '관리자 권한이 필요합니다.' }} replace />;
  }

  return <>{children}</>;
}
