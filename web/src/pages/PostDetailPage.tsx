/**
 * 게시글 상세 페이지 (TASK_WEB Step 3, Step 5).
 * GET /api/posts/{id}. XSS 방지: React 기본 이스케이프. 지도·거리 표시.
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { useAuthStore } from '@/store/authStore';
import { MapWithLocation, DistanceDisplay } from '@/components';
import { AppLayout } from '@/components/AppLayout';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const postId = id ? Number(id) : NaN;

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.get(postId),
    enabled: !Number.isNaN(postId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/posts');
    },
  });

  if (Number.isNaN(postId)) return <AppLayout><div className="text-red-600">잘못된 경로입니다.</div></AppLayout>;
  if (isLoading) return <AppLayout><div className="text-slate-600">로딩 중...</div></AppLayout>;
  if (error || !data?.data) return <AppLayout><div className="text-red-600">게시글을 찾을 수 없습니다.</div></AppLayout>;

  const post = data.data;
  const isAuthor = user?.id === post.authorId;

  return (
    <AppLayout
      nav={
        <>
          <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← 목록
          </Link>
          {isAuthor && (
            <>
              <Link to={`/posts/${post.id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                수정
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('정말 삭제하시겠습니까?')) deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
                className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
              >
                삭제
              </button>
            </>
          )}
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          {post.notice && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              공지
            </span>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          {post.authorNickname} · {new Date(post.createdAt).toLocaleString('ko-KR')}
        </p>
        <div className="whitespace-pre-wrap text-slate-700">{post.content}</div>
        {post.latitude != null && post.longitude != null && (
          <div className="mt-6 space-y-2">
            <MapWithLocation
              latitude={post.latitude}
              longitude={post.longitude}
              label="게시글 위치"
            />
            <DistanceDisplay destLat={post.latitude} destLng={post.longitude} />
          </div>
        )}
      </article>
    </AppLayout>
  );
}
