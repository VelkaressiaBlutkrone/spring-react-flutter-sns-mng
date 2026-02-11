/**
 * 이미지 게시글 작성 페이지 (TASK_WEB Step 3).
 * POST /api/image-posts (multipart/form-data). 로그인 필수.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { imagePostsApi } from '@/api/imagePosts';

export default function ImagePostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof imagePostsApi.create>[0]) => imagePostsApi.create(params),
    onSuccess: (res) => {
      navigate(`/image-posts/${res.data.id}`);
    },
    onError: (err: { response?: { data?: { fieldErrors?: Array<{ field: string; reason: string }> } } }) => {
      const errors: Record<string, string> = {};
      for (const fe of err.response?.data?.fieldErrors ?? []) {
        errors[fe.field] = fe.reason;
      }
      if (err.response?.data?.message) {
        errors._form = err.response.data.message;
      }
      setFieldErrors(errors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!image) {
      setFieldErrors({ image: '이미지 파일이 필요합니다.' });
      return;
    }

    const lat = latitude ? Number(latitude) : undefined;
    const lng = longitude ? Number(longitude) : undefined;

    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      image,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <nav className="mb-6 border-b border-gray-200 pb-4">
        <Link to="/image-posts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← 목록으로
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">이미지 게시글 작성</h1>

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

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            이미지
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
          {fieldErrors.image && <p className="mt-1 text-sm text-red-600">{fieldErrors.image}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
              위도 (선택)
            </label>
            <input
              id="latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="예: 37.5665"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
              경도 (선택)
            </label>
            <input
              id="longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="예: 126.9780"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">지도 Pin 선택 UI는 Step 5에서 연동됩니다.</p>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending ? '등록 중...' : '등록'}
          </button>
          <Link to="/image-posts" className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
