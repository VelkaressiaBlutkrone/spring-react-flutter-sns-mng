/**
 * Pin별 게시글 목록 페이지 (TASK_WEB Step 4).
 * GET /api/pins/{id}/posts, GET /api/pins/{id}/image-posts.
 */
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { pinsApi } from '@/api/pins';
import { getImageUrl } from '@/utils/imageUrl';

export default function PinPostsPage() {
  const { id } = useParams<{ id: string }>();
  const pinId = id ? parseInt(id, 10) : NaN;
  const [postPage, setPostPage] = useState(0);
  const [imagePostPage, setImagePostPage] = useState(0);
  const size = 10;

  const postsQuery = useQuery({
    queryKey: ['pins', pinId, 'posts', postPage],
    queryFn: () => pinsApi.getPosts(pinId, { page: postPage, size }),
    enabled: !Number.isNaN(pinId),
  });

  const imagePostsQuery = useQuery({
    queryKey: ['pins', pinId, 'image-posts', imagePostPage],
    queryFn: () => pinsApi.getImagePosts(pinId, { page: imagePostPage, size }),
    enabled: !Number.isNaN(pinId),
  });

  if (Number.isNaN(pinId)) {
    return (
      <div className="p-8 text-red-600">잘못된 Pin ID입니다.</div>
    );
  }

  const postsLoading = postsQuery.isLoading;
  const imagePostsLoading = imagePostsQuery.isLoading;
  const postsError = postsQuery.error;
  const imagePostsError = imagePostsQuery.error;

  const posts = postsQuery.data?.data.content ?? [];
  const imagePosts = imagePostsQuery.data?.data.content ?? [];
  const postsTotalPages = postsQuery.data?.data.totalPages ?? 0;
  const imagePostsTotalPages = imagePostsQuery.data?.data.totalPages ?? 0;
  const postsTotalElements = postsQuery.data?.data.totalElements ?? 0;
  const imagePostsTotalElements = imagePostsQuery.data?.data.totalElements ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-lg font-bold text-slate-900">Pin #{pinId} 게시글</h1>
          <div className="flex gap-4">
            <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              홈
            </Link>
            <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              게시글
            </Link>
            <Link to="/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              이미지
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">일반 게시글</h2>
          {postsLoading ? (
            <p className="text-slate-600">로딩 중...</p>
          ) : postsError ? (
            <p className="text-red-600">게시글을 불러오지 못했습니다.</p>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              이 Pin에 연결된 게시글이 없습니다.
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow"
                  >
                    <Link to={`/posts/${post.id}`}>
                      <div className="flex gap-2">
                        {post.notice && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            공지
                          </span>
                        )}
                        <h3 className="font-semibold text-slate-900">{post.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              {postsTotalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPostPage((p) => Math.max(0, p - 1))}
                    disabled={postPage === 0}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    {postPage + 1} / {postsTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPostPage((p) => Math.min(postsTotalPages - 1, p + 1))}
                    disabled={postPage >= postsTotalPages - 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
              <p className="mt-2 text-sm text-slate-500">총 {postsTotalElements}건</p>
            </>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">이미지 게시글</h2>
          {imagePostsLoading ? (
            <p className="text-slate-600">로딩 중...</p>
          ) : imagePostsError ? (
            <p className="text-red-600">이미지 게시글을 불러오지 못했습니다.</p>
          ) : imagePosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              이 Pin에 연결된 이미지 게시글이 없습니다.
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {imagePosts.map((post) => (
                  <li
                    key={post.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow"
                  >
                    <Link to={`/image-posts/${post.id}`} className="flex gap-4">
                      {post.imageUrl && (
                        <img
                          src={getImageUrl(post.imageUrl)}
                          alt={post.title}
                          className="h-24 w-24 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex gap-2">
                          {post.notice && (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              공지
                            </span>
                          )}
                          <h3 className="font-semibold text-slate-900">{post.title}</h3>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {post.authorNickname} ·{' '}
                          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {imagePostsTotalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImagePostPage((p) => Math.max(0, p - 1))}
                    disabled={imagePostPage === 0}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    {imagePostPage + 1} / {imagePostsTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setImagePostPage((p) => Math.min(imagePostsTotalPages - 1, p + 1))
                    }
                    disabled={imagePostPage >= imagePostsTotalPages - 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
              <p className="mt-2 text-sm text-slate-500">총 {imagePostsTotalElements}건</p>
            </>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}
