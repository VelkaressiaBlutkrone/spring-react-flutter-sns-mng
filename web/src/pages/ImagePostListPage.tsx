/**
 * 이미지 게시글 목록 페이지 (TASK_WEB Step 3).
 * GET /api/image-posts, 페이징·검색·공지 상단.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { imagePostsApi } from '@/api/imagePosts';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/utils/imageUrl';
import { AppLayout } from '@/components/AppLayout';

export default function ImagePostListPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const size = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['image-posts', page, keyword],
    queryFn: () => imagePostsApi.list({ page, size, keyword: keyword || undefined }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  if (isLoading) return <AppLayout title="이미지 게시글"><div className="text-slate-600">로딩 중...</div></AppLayout>;
  if (error) return <AppLayout title="이미지 게시글"><div className="text-red-600">목록을 불러오지 못했습니다.</div></AppLayout>;

  const content = data?.data.content ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const totalElements = data?.data.totalElements ?? 0;

  return (
    <AppLayout
      title="이미지 게시글"
      nav={
        <>
          <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/image-posts/create"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          이미지 글쓰기
        </Link>
        <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button type="submit" className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500">
          검색
        </button>
      </form>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.length === 0 ? (
          <li className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            이미지 게시글이 없습니다.
          </li>
        ) : (
          content.map((post) => (
            <li key={post.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow">
              <Link to={`/image-posts/${post.id}`}>
                <img
                  src={getImageUrl(post.imageUrl)}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2">
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
                </div>
              </Link>
              <div className="flex justify-end border-t border-slate-100 p-2">
                {user?.id === post.authorId && (
                  <Link
                    to={`/image-posts/${post.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    수정
                  </Link>
                )}
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
