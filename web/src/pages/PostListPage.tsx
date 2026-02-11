/**
 * 게시글 목록 페이지 (TASK_WEB Step 3).
 * GET /api/posts, 페이징·검색·공지 상단.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { postsApi } from '@/api/posts';
import { useAuthStore } from '@/store/authStore';

export default function PostListPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const size = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', page, keyword],
    queryFn: () => postsApi.list({ page, size, keyword: keyword || undefined }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  if (isLoading) return <div className="p-8 text-gray-600">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-600">목록을 불러오지 못했습니다.</div>;

  const content = data?.data.content ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const totalElements = data?.data.totalElements ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <nav className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">게시글 목록</h1>
        <div className="flex gap-4">
          <Link to="/posts/create" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            게시글 작성
          </Link>
          <Link to="/image-posts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            이미지 게시글
          </Link>
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            홈
          </Link>
        </div>
      </nav>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
          검색
        </button>
      </form>

      <ul className="space-y-4">
        {content.length === 0 ? (
          <li className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
            게시글이 없습니다.
          </li>
        ) : (
          content.map((post) => (
            <li key={post.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <Link to={`/posts/${post.id}`} className="flex-1">
                  <div className="flex items-center gap-2">
                    {post.notice && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        공지
                      </span>
                    )}
                    <h2 className="font-semibold text-gray-900">{post.title}</h2>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
                {user?.id === post.authorId && (
                  <Link
                    to={`/posts/${post.id}/edit`}
                    className="ml-4 text-sm text-blue-600 hover:text-blue-500"
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
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-1 text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">총 {totalElements}건</p>
    </div>
  );
}
