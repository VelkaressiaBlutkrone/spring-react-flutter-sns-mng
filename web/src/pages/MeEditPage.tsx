/**
 * 개인정보 수정 페이지 (TASK_WEB Step 6).
 * PUT /api/me — 닉네임 등 수정.
 * RULE 1.2: 본인만 수정 가능.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { meApi } from '@/api/me';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/AppLayout';
import type { ErrorResponse } from '@/types';

interface FieldError {
  field: string;
  value: string | null;
  reason: string;
}

export default function MeEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const [nickname, setNickname] = useState(user?.nickname ?? '');

  useEffect(() => {
    if (user?.nickname) setNickname(user.nickname);
  }, [user?.nickname]);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  const mutation = useMutation({
    mutationFn: (data: { nickname: string }) => meApi.updateMe(data),
    onSuccess: (res) => {
      if (res.data) {
        setUser({
          id: res.data.id,
          email: res.data.email,
          nickname: res.data.nickname,
          role: res.data.role,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/me');
    },
    onError: (err: unknown) => {
      const res = (err as { response?: { data?: ErrorResponse } })?.response;
      const data = res?.data;
      if (data?.fieldErrors && Array.isArray(data.fieldErrors)) {
        setFieldErrors(data.fieldErrors);
        setMessage(data.message ?? '입력값을 확인해 주세요.');
      } else {
        setMessage(data?.message ?? '저장에 실패했습니다.');
      }
    },
  });

  const getFieldError = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.reason;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setFieldErrors([]);

    const trimmed = nickname.trim();
    if (!trimmed) {
      setFieldErrors([{ field: 'nickname', value: nickname, reason: '닉네임을 입력해주세요.' }]);
      return;
    }
    if (trimmed.length > 100) {
      setFieldErrors([{ field: 'nickname', value: nickname, reason: '닉네임은 100자 이하여야 합니다.' }]);
      return;
    }

    mutation.mutate({ nickname: trimmed });
  };

  return (
    <AppLayout
      title="개인정보 수정"
      nav={
        <>
          <Link to="/me" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            마이페이지
          </Link>
          <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글
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
      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            id="email"
            type="text"
            value={user?.email ?? ''}
            disabled
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-600"
          />
          <p className="mt-1 text-xs text-slate-500">이메일은 수정할 수 없습니다.</p>
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-slate-700">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={100}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="닉네임"
          />
          {getFieldError('nickname') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('nickname')}</p>
          )}
        </div>

        {message && !fieldErrors.length && (
          <p className="text-sm text-red-600" role="alert">
            {message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {mutation.isPending ? '저장 중...' : '저장'}
          </button>
          <Link
            to="/me"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </Link>
        </div>
      </form>
    </AppLayout>
  );
}
