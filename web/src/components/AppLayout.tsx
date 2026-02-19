/**
 * 공통 페이지 레이아웃 — 헤더 + 메인 영역.
 * 디자인 일관성 유지.
 */
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';

export interface AppLayoutProps {
  children: React.ReactNode;
  /** 메인 최대 너비 (기본 mx-auto max-w-4xl) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full';
  title?: string;
  /** 상단 네비게이션 링크 (커스텀) */
  nav?: React.ReactNode;
}

const maxWidthClass = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function AppLayout({ children, maxWidth = '4xl', title, nav }: AppLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-bold text-slate-900">
            지도 SNS
          </Link>
          <nav className="flex items-center gap-3">
            {nav ?? (
              <>
                <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  게시글
                </Link>
                <Link to="/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  이미지
                </Link>
                <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  About
                </Link>
                <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  홈
                </Link>
              </>
            )}
            {accessToken ? (
              <>
                {user && (
                  <Link to="/me" className="text-sm text-slate-600 hover:text-slate-900">
                    {user.nickname}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  로그인
                </Link>
                <Link to="/signup" className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className={`mx-auto px-4 py-6 sm:px-6 ${maxWidthClass[maxWidth]}`}>
        {title && (
          <h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}
