/**
 * 관리자 회원 목록 페이지 (TASK_WEB Step 7).
 * GET /api/admin/members. 페이징·검색.
 * RULE 1.2: ROLE_ADMIN 전용.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminMembersApi } from '@/api/admin';
import { AppLayout } from '@/components/AppLayout';

export default function AdminMemberListPage() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const size = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'members', page, keyword],
    queryFn: () => adminMembersApi.list({ page, size, keyword: keyword || undefined }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  if (isLoading) return <AppLayout title="관리자 - 회원"><div className="text-slate-600">로딩 중...</div></AppLayout>;
  if (error) return <AppLayout title="관리자 - 회원"><div className="text-red-600">목록을 불러오지 못했습니다.</div></AppLayout>;

  const content = data?.data.content ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const totalElements = data?.data.totalElements ?? 0;

  return (
    <AppLayout
      title="관리자 - 회원"
      nav={
        <>
          <Link to="/admin/members/new" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            회원 추가
          </Link>
          <Link to="/admin/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글
          </Link>
          <Link to="/admin/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            이미지 게시글
          </Link>
          <Link to="/admin/stats" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            통계
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="이메일/닉네임 검색"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          검색
        </button>
      </form>

      <ul className="space-y-4">
        {content.length === 0 ? (
          <li className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            회원이 없습니다.
          </li>
        ) : (
          content.map((member) => (
            <li key={member.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {member.role}
                    </span>
                    <span className="font-semibold text-slate-900">{member.nickname}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{member.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    가입일: {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <Link
                  to={`/admin/members/${member.id}/edit`}
                  className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  수정
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-2 text-sm text-slate-600">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      <p className="mt-4 text-sm text-slate-500">총 {totalElements}건</p>
    </AppLayout>
  );
}
