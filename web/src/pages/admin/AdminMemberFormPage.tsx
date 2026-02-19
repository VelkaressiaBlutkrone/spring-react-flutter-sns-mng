/**
 * 관리자 회원 추가/수정 폼 페이지 (TASK_WEB Step 7).
 * POST /api/admin/members, PUT /api/admin/members/{id}.
 * RULE 1.2: ROLE_ADMIN 전용.
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminMembersApi, type AdminMemberCreateRequest, type AdminMemberUpdateRequest } from '@/api/admin';
import { AppLayout } from '@/components/AppLayout';
import type { ErrorResponse } from '@/types';

export default function AdminMemberFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;
  const memberId = id ? Number(id) : NaN;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'member', memberId],
    queryFn: () => adminMembersApi.get(memberId),
    enabled: !isNew && !Number.isNaN(memberId),
  });

  const member = data?.data;

  useEffect(() => {
    if (member) {
      setEmail(member.email);
      setNickname(member.nickname);
      setRole((member.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN');
    }
  }, [member]);

  const createMutation = useMutation({
    mutationFn: (data: AdminMemberCreateRequest) => adminMembersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      navigate('/admin/members');
    },
    onError: (err: { response?: { data?: ErrorResponse } }) => {
      const data = err.response?.data;
      const errors: Record<string, string> = {};
      for (const fe of data?.fieldErrors ?? []) {
        errors[fe.field] = fe.reason;
      }
      if (data?.message) errors._form = data.message;
      setFieldErrors(errors);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AdminMemberUpdateRequest) => adminMembersApi.update(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'member', memberId] });
      navigate('/admin/members');
    },
    onError: (err: { response?: { data?: ErrorResponse } }) => {
      const data = err.response?.data;
      const errors: Record<string, string> = {};
      for (const fe of data?.fieldErrors ?? []) {
        errors[fe.field] = fe.reason;
      }
      if (data?.message) errors._form = data.message;
      setFieldErrors(errors);
    },
  });

  if (!isNew && Number.isNaN(memberId)) return <AppLayout><div className="text-red-600">잘못된 경로입니다.</div></AppLayout>;
  if (!isNew && (isLoading || error)) return <AppLayout><div className="text-slate-600">로딩 중...</div></AppLayout>;
  if (!isNew && !member) return <AppLayout><div className="text-red-600">회원을 찾을 수 없습니다.</div></AppLayout>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (isNew) {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedNickname = nickname.trim();
      if (!trimmedEmail || !trimmedPassword || !trimmedNickname) {
        setFieldErrors({ _form: '이메일, 비밀번호, 닉네임을 모두 입력해 주세요.' });
        return;
      }
      createMutation.mutate({
        email: trimmedEmail,
        password: trimmedPassword,
        nickname: trimmedNickname,
        role,
      });
    } else {
      const trimmedNickname = nickname.trim();
      if (!trimmedNickname) {
        setFieldErrors({ nickname: '닉네임을 입력해 주세요.' });
        return;
      }
      updateMutation.mutate({ nickname: trimmedNickname, role });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout
      title={isNew ? '회원 추가' : '회원 수정'}
      nav={
        <>
          <Link to="/admin/members" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            회원 목록
          </Link>
          <Link to="/admin/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글
          </Link>
          <Link to="/admin/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            이미지 게시글
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
        {fieldErrors._form && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{fieldErrors._form}</p>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isNew}
            required={isNew}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 disabled:bg-slate-50 disabled:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {!isNew && <p className="mt-1 text-xs text-slate-500">이메일은 수정할 수 없습니다.</p>}
          {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        {isNew && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
          </div>
        )}

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
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {fieldErrors.nickname && <p className="mt-1 text-sm text-red-600">{fieldErrors.nickname}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700">
            역할
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
          <Link
            to="/admin/members"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </Link>
        </div>
      </form>
    </AppLayout>
  );
}
