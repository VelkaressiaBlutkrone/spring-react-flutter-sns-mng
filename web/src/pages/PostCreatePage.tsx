/**
 * 게시글 작성 페이지 (TASK_WEB Step 3, Step 5).
 * POST /api/posts. 로그인 필수. LocationPicker로 위치·Pin 선택.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { postsApi } from '@/api/posts';
import { LocationPicker } from '@/components/LocationPicker';
import { AppLayout } from '@/components/AppLayout';
import type { PostCreateRequest } from '@/types/post';
import type { LocationValue } from '@/components/LocationPicker';

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: PostCreateRequest) => postsApi.create(data),
    onSuccess: (res) => {
      navigate(`/posts/${res.data.id}`);
    },
    onError: (err: { response?: { data?: { fieldErrors?: Array<{ field: string; reason: string }> } } }) => {
      const errors: Record<string, string> = {};
      for (const fe of err.response?.data?.fieldErrors ?? []) {
        errors[fe.field] = fe.reason;
      }
      setFieldErrors(errors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      latitude: location?.latitude,
      longitude: location?.longitude,
      pinId: location?.pinId,
    });
  };

  return (
    <AppLayout
      nav={
        <>
          <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← 목록
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">게시글 작성</h1>

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

        <LocationPicker value={location} onChange={setLocation} mapHeight={280} />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending ? '등록 중...' : '등록'}
          </button>
          <Link to="/posts" className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
            취소
          </Link>
        </div>
      </form>
    </AppLayout>
  );
}
