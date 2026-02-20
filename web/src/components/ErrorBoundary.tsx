/**
 * React Error Boundary (TASK_WEB Step 9, RULE 2.2.3).
 * 예상치 못한 런타임 에러 포착 → 내부 정보 노출 없이 사용자 친화적 화면 표시.
 * 스택 트레이스 사용자 반환 금지 (RULE 1.4.1).
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  /** 에러 발생 시 대체 렌더링 (기본: 내장 fallback UI) */
  readonly fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 스택 트레이스는 콘솔(개발 도구)에만 기록 — 사용자 화면에 노출하지 않음
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-8 text-center shadow">
            <p className="text-4xl">⚠️</p>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">오류가 발생했습니다</h2>
            <p className="mt-2 text-sm text-slate-500">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => globalThis.window.location.reload()}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
