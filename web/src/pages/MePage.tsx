/**
 * 마이페이지 (TASK_WEB Step 6).
 * 내 게시글·이미지 게시글·Pin 목록, 개인정보 수정 링크.
 * RULE 1.2: 리소스 소유권 검증 (로그인 사용자 전용).
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { meApi } from '@/api/me';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { getImageUrl } from '@/utils/imageUrl';
import type { PostResponse } from '@/types/post';
import type { ImagePostResponse } from '@/types/imagePost';
import type { PinResponse } from '@/types/pin';

type TabType = 'posts' | 'image-posts' | 'pins';

export default function MePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [page, setPage] = useState(0);
  const size = 10;

  const postsQuery = useQuery({
    queryKey: ['me', 'posts', page],
    queryFn: () => meApi.getMyPosts({ page, size }),
    enabled: activeTab === 'posts',
  });

  const imagePostsQuery = useQuery({
    queryKey: ['me', 'image-posts', page],
    queryFn: () => meApi.getMyImagePosts({ page, size }),
    enabled: activeTab === 'image-posts',
  });

  const pinsQuery = useQuery({
    queryKey: ['me', 'pins', page],
    queryFn: () => meApi.getMyPins({ page, size }),
    enabled: activeTab === 'pins',
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(0);
  };

  const tabs = [
    { id: 'posts' as const, label: '내 게시글' },
    { id: 'image-posts' as const, label: '내 이미지 게시글' },
    { id: 'pins' as const, label: '내 Pin' },
  ];

  const isLoading =
    (activeTab === 'posts' && postsQuery.isLoading) ||
    (activeTab === 'image-posts' && imagePostsQuery.isLoading) ||
    (activeTab === 'pins' && pinsQuery.isLoading);

  const error =
    (activeTab === 'posts' && postsQuery.error) ||
    (activeTab === 'image-posts' && imagePostsQuery.error) ||
    (activeTab === 'pins' && pinsQuery.error);

  let content: PostResponse[] | ImagePostResponse[] | PinResponse[] = [];
  let totalPages = 0;
  let totalElements = 0;

  if (activeTab === 'posts' && postsQuery.data?.data) {
    content = postsQuery.data.data.content;
    totalPages = postsQuery.data.data.totalPages;
    totalElements = postsQuery.data.data.totalElements;
  } else if (activeTab === 'image-posts' && imagePostsQuery.data?.data) {
    content = imagePostsQuery.data.data.content;
    totalPages = imagePostsQuery.data.data.totalPages;
    totalElements = imagePostsQuery.data.data.totalElements;
  } else if (activeTab === 'pins' && pinsQuery.data?.data) {
    content = pinsQuery.data.data.content;
    totalPages = pinsQuery.data.data.totalPages;
    totalElements = pinsQuery.data.data.totalElements;
  }

  return (
    <AppLayout
      title="마이페이지"
      nav={
        <>
          <Link to="/me/edit" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            개인정보 수정
          </Link>
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
      }
    >
      {user && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">이메일: {user.email}</p>
              <p className="text-sm text-slate-600">닉네임: {user.nickname}</p>
              <p className="text-sm text-slate-600">역할: {user.role}</p>
            </div>
            <Link
              to="/me/edit"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              수정
            </Link>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          로딩 중...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
          목록을 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !error && (
        <>
          {activeTab === 'posts' && (
            <ul className="space-y-4">
              {content.length === 0 ? (
                <li className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  작성한 게시글이 없습니다.
                </li>
              ) : (
                (content as PostResponse[]).map((post) => (
                  <li
                    key={post.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow"
                  >
                    <Link to={`/posts/${post.id}`} className="block">
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
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </Link>
                    <div className="mt-2 flex justify-end">
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        수정
                      </Link>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          {activeTab === 'image-posts' && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.length === 0 ? (
                <li className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  작성한 이미지 게시글이 없습니다.
                </li>
              ) : (
                (content as ImagePostResponse[]).map((post) => (
                  <li
                    key={post.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <Link to={`/image-posts/${post.id}`}>
                      <img
                        src={getImageUrl(post.imageUrl)}
                        alt={post.title}
                        className="h-48 w-full object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                          {post.notice && (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              공지
                            </span>
                          )}
                          <h2 className="font-semibold text-slate-900">{post.title}</h2>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </Link>
                    <div className="flex justify-end border-t border-slate-100 p-2">
                      <Link
                        to={`/image-posts/${post.id}/edit`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        수정
                      </Link>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          {activeTab === 'pins' && (
            <ul className="space-y-4">
              {content.length === 0 ? (
                <li className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  등록한 Pin이 없습니다.
                </li>
              ) : (
                (content as PinResponse[]).map((pin) => (
                  <li
                    key={pin.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow"
                  >
                    <Link to={`/pins/${pin.id}/posts`} className="block">
                      <p className="font-medium text-slate-900">
                        위도 {pin.latitude.toFixed(4)}, 경도 {pin.longitude.toFixed(4)}
                      </p>
                      {pin.description && (
                        <p className="mt-1 text-sm text-slate-600">{pin.description}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(pin.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </Link>
                    <div className="mt-2">
                      <Link
                        to={`/pins/${pin.id}/posts`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        연결된 게시글 보기
                      </Link>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

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
        </>
      )}
    </AppLayout>
  );
}
