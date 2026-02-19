/**
 * 관리자 게시글 목록 페이지 (TASK_WEB Step 7).
 * GET /api/admin/posts. 페이징·검색·공지 토글·수정·삭제.
 * RULE 1.2: ROLE_ADMIN 전용.
 */
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminPostsApi } from '@/api/admin';
import { AppLayout } from '@/components/AppLayout';

export default function AdminPostListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const size = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'posts', page, keyword],
    queryFn: () => adminPostsApi.list({ page, size, keyword: keyword || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminPostsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  if (isLoading) return <AppLayout title="관리자 - 게시글"><div className="text-slate-600">로딩 중...</div></AppLayout>;
  if (error) return <AppLayout title="관리자 - 게시글"><div className="text-red-600">목록을 불러오지 못했습니다.</div></AppLayout>;

  const content = data?.data.content ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const totalElements = data?.data.totalElements ?? 0;

  return (
    <AppLayout
      title="관리자 - 게시글"
      nav={
        <>
          <Link to="/admin/members" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            회원
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
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          검색
        </button>
      </form>

      <ul className="space-y-4">
        {content.length === 0 ? (
          <li className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            게시글이 없습니다.
          </li>
        ) : (
          content.map((post) => (
            <li key={post.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/posts/${post.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.notice && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        공지
                      </span>
                    )}
                    <h2 className="font-semibold text-slate-900">{post.title}</h2>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <NoticeToggleButton postId={post.id} notice={post.notice} />
                  <Link
                    to={`/admin/posts/${post.id}/edit`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('정말 삭제하시겠습니까?')) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
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

function NoticeToggleButton({ postId, notice }: { postId: number; notice: boolean }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => adminPostsApi.toggleNotice(postId, !notice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        notice ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
      } hover:opacity-80 disabled:opacity-50`}
    >
      {notice ? '공지 해제' : '공지'}
    </button>
  );
}
