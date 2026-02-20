/**
 * 통계 테이블 컴포넌트 (TASK_WEB Step 8).
 * RULE 2.3: 읽기 전용.
 */
import type { PostStatsItem } from '@/api/admin/stats';

interface StatsTableProps {
  readonly items: PostStatsItem[];
  readonly title?: string;
}

export function StatsTable({ items, title }: StatsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        {title && <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>}
        표시할 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                기간
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                일반 게시글
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                이미지 게시글
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                합계
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((item) => (
              <tr key={item.periodLabel} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                  {item.periodLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                  {item.postCount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                  {item.imagePostCount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-900">
                  {(item.postCount + item.imagePostCount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
