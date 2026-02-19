/**
 * 게시글 수정 페이지 (TASK_WEB Step 3).
 * PUT /api/posts/{id}. 작성자만. 403 처리.
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { useAuthStore } from '@/store/authStore';
import { LocationPicker } from '@/components/LocationPicker';
import type { PostUpdateRequest } from '@/types/post';
import type { LocationValue } from '@/components/LocationPicker';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const postId = id ? Number(id) : NaN;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.get(postId),
    enabled: !Number.isNaN(postId),
  });

  const post = data?.data;

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      if (post.latitude != null && post.longitude != null) {
        setLocation({
          latitude: post.latitude,
          longitude: post.longitude,
          pinId: post.pinId ?? undefined,
        });
      } else {
        setLocation(null);
      }
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (data: PostUpdateRequest) => postsApi.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(`/posts/${postId}`);
    },
    onError: (err: { response?: { status?: number; data?: { fieldErrors?: Array<{ field: string; reason: string }> } } }) => {
      if (err.response?.status === 403) {
        setFieldErrors({ _form: '수정 권한이 없습니다.' });
      } else {
        const errors: Record<string, string> = {};
        for (const fe of err.response?.data?.fieldErrors ?? []) {
          errors[fe.field] = fe.reason;
        }
        setFieldErrors(errors);
      }
    },
  });

  if (Number.isNaN(postId)) return <div className="p-8 text-red-600">잘못된 경로입니다.</div>;
  if (isLoading || !post) return <div className="p-8 text-gray-600">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-600">게시글을 찾을 수 없습니다.</div>;

  const isAuthor = user?.id === post.authorId;
  if (!isAuthor) return <div className="p-8 text-red-600">수정 권한이 없습니다.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    updateMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      pinId: location?.pinId ?? null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <nav className="mb-6 border-b border-gray-200 pb-4">
        <Link to={`/posts/${postId}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← 상세로
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">게시글 수정</h1>

        {fieldErrors._form && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{fieldErrors._form}</p>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
          {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
          {fieldErrors.content && <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>}
        </div>

        <LocationPicker value={location} onChange={setLocation} mapHeight={280} />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </button>
          <Link to={`/posts/${postId}`} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
