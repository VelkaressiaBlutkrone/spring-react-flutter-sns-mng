/**
 * 관리자 통계 페이지 (TASK_WEB Step 8).
 * 가입·로그인·글 통계 API 연동, 기간 필터·테이블·차트.
 * RULE 1.2: ROLE_ADMIN 전용, RULE 2.3: 읽기 전용.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminStatsApi, type StatsUnit } from '@/api/admin/stats';
import { StatsChart } from '@/components/admin/StatsChart';
import { StatsTable } from '@/components/admin/StatsTable';
import { AppLayout } from '@/components/AppLayout';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDefaultRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

export default function AdminStatsPage() {
  const defaultRange = getDefaultRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [unit, setUnit] = useState<StatsUnit>('day');

  const params = { startDate, endDate };

  const signupQuery = useQuery({
    queryKey: ['admin', 'stats', 'signup', startDate, endDate],
    queryFn: () => adminStatsApi.signup(params),
    enabled: !!startDate && !!endDate,
  });

  const loginQuery = useQuery({
    queryKey: ['admin', 'stats', 'login', startDate, endDate],
    queryFn: () => adminStatsApi.login(params),
    enabled: !!startDate && !!endDate,
  });

  const postsQuery = useQuery({
    queryKey: ['admin', 'stats', 'posts', startDate, endDate, unit],
    queryFn: () => adminStatsApi.posts({ ...params, unit }),
    enabled: !!startDate && !!endDate,
  });

  const signupData = signupQuery.data?.data;
  const loginData = loginQuery.data?.data;
  const postsData = postsQuery.data?.data;

  const isLoading = signupQuery.isLoading || loginQuery.isLoading || postsQuery.isLoading;
  const hasError =
    signupQuery.isError || loginQuery.isError || postsQuery.isError;

  const unitLabels: Record<StatsUnit, string> = {
    day: '일',
    week: '주',
    month: '월',
    quarter: '분기',
    year: '년',
  };

  return (
    <AppLayout
      title="관리자 - 통계"
      nav={
        <>
          <Link to="/admin/members" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            회원
          </Link>
          <Link to="/admin/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글
          </Link>
          <Link to="/admin/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            이미지 게시글
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <label htmlFor="stats-start-date" className="mb-1 block text-xs font-medium text-slate-600">
              시작일
            </label>
            <input
              id="stats-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="stats-end-date" className="mb-1 block text-xs font-medium text-slate-600">
              종료일
            </label>
            <input
              id="stats-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="stats-unit" className="mb-1 block text-xs font-medium text-slate-600">
              글 통계 단위
            </label>
            <select
              id="stats-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as StatsUnit)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {(Object.keys(unitLabels) as StatsUnit[]).map((u) => (
                <option key={u} value={u}>
                  {unitLabels[u]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            로딩 중...
          </div>
        )}

        {hasError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            통계를 불러오지 못했습니다. 권한을 확인하거나 다시 시도해 주세요.
          </div>
        )}

        {!isLoading && !hasError && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  가입 통계
                </h3>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {(signupData?.totalCount ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">기간 내 가입자 수</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  로그인 통계
                </h3>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {(loginData?.loginCount ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">기간 내 로그인 횟수</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  활성 사용자
                </h3>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {(loginData?.activeUsers ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">기간 내 로그인한 고유 사용자</p>
              </div>
            </div>

            <StatsChart items={postsData?.items ?? []} title="글 통계 (기간별)" />

            <StatsTable items={postsData?.items ?? []} title="글 통계 상세" />
          </>
        )}
      </div>
    </AppLayout>
  );
}
