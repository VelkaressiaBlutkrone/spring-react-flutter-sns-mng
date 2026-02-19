/**
 * 관리자 게시글 수정 페이지 (TASK_WEB Step 7).
 * PUT /api/admin/posts/{id}. ROLE_ADMIN 전용.
 * RULE 1.2: 관리자 권한으로 타인 글도 수정 가능.
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPostsApi } from '@/api/admin';
import { AppLayout } from '@/components/AppLayout';
import type { PostUpdateRequest } from '@/types/post';

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const postId = id ? Number(id) : NaN;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'post', postId],
    queryFn: () => adminPostsApi.get(postId),
    enabled: !Number.isNaN(postId),
  });

  const post = data?.data;

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (data: PostUpdateRequest) => adminPostsApi.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'post', postId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      navigate(`/posts/${postId}`);
    },
    onError: (err: { response?: { data?: { fieldErrors?: Array<{ field: string; reason: string }>; message?: string } } }) => {
      const errors: Record<string, string> = {};
      for (const fe of err.response?.data?.fieldErrors ?? []) {
        errors[fe.field] = fe.reason;
      }
      if (err.response?.data?.message) errors._form = err.response.data.message;
      setFieldErrors(errors);
    },
  });

  if (Number.isNaN(postId)) return <AppLayout><div className="text-red-600">잘못된 경로입니다.</div></AppLayout>;
  if (isLoading || !post) return <AppLayout><div className="text-slate-600">로딩 중...</div></AppLayout>;
  if (error) return <AppLayout><div className="text-red-600">게시글을 찾을 수 없습니다.</div></AppLayout>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    updateMutation.mutate({ title: title.trim(), content: content.trim() });
  };

  return (
    <AppLayout
      title="관리자 - 게시글 수정"
      nav={
        <>
          <Link to="/admin/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글 목록
          </Link>
          <Link to={`/posts/${postId}`} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            상세
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {fieldErrors._form && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{fieldErrors._form}</p>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {fieldErrors.content && <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </button>
          <Link
            to={`/posts/${postId}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            취소
          </Link>
        </div>
      </form>
    </AppLayout>
  );
}
