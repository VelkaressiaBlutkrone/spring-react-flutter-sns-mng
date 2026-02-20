/**
 * 통계 차트 컴포넌트 (TASK_WEB Step 8).
 * Recharts 기반. RULE 2.3: 읽기 전용.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PostStatsItem } from '@/api/admin/stats';

interface StatsChartProps {
  readonly items: PostStatsItem[];
  readonly title?: string;
}

export function StatsChart({ items, title }: StatsChartProps) {
  const data = items.map((item) => ({
    name: item.periodLabel,
    일반게시글: item.postCount,
    이미지게시글: item.imagePostCount,
    합계: item.postCount + item.imagePostCount,
  }));

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        {title && <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>}
        표시할 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {title && <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number) => [value, '']}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="일반게시글" fill="#3b82f6" name="일반 게시글" radius={[4, 4, 0, 0]} />
          <Bar dataKey="이미지게시글" fill="#10b981" name="이미지 게시글" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
