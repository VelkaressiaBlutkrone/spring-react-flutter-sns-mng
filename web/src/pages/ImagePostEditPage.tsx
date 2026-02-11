/**
 * 이미지 게시글 수정 페이지 (TASK_WEB Step 3).
 * PUT /api/image-posts/{id} (multipart). 작성자만. 403 처리.
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagePostsApi } from '@/api/imagePosts';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/utils/imageUrl';

export default function ImagePostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const postId = id ? Number(id) : NaN;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['image-post', postId],
    queryFn: () => imagePostsApi.get(postId),
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
    mutationFn: (params: Parameters<typeof imagePostsApi.update>[1]) => imagePostsApi.update(postId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-post', postId] });
      queryClient.invalidateQueries({ queryKey: ['image-posts'] });
      navigate(`/image-posts/${postId}`);
    },
    onError: (err: { response?: { status?: number; data?: { fieldErrors?: Array<{ field: string; reason: string }>; message?: string } } }) => {
      if (err.response?.status === 403) {
        setFieldErrors({ _form: '수정 권한이 없습니다.' });
      } else {
        const errors: Record<string, string> = {};
        for (const fe of err.response?.data?.fieldErrors ?? []) {
          errors[fe.field] = fe.reason;
        }
        if (err.response?.data?.message) {
          errors._form = err.response.data.message;
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
      image: image ?? undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <nav className="mb-6 border-b border-gray-200 pb-4">
        <Link to={`/image-posts/${postId}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← 상세로
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">이미지 게시글 수정</h1>

        {fieldErrors._form && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{fieldErrors._form}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">현재 이미지</label>
          <img
            src={getImageUrl(post.imageUrl)}
            alt={post.title}
            className="mt-1 max-h-48 rounded border object-contain"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            이미지 변경 (선택, 새 파일 선택 시 교체)
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

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

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </button>
          <Link to={`/image-posts/${postId}`} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
