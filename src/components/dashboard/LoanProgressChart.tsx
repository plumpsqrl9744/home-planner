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
import type { SimulationResult } from '../../types/result';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';

export function LoanProgressChart({ result, accent }: { result: SimulationResult; accent: string }) {
  const total = result.loan.finalLoan;
  if (total <= 0) {
    return (
      <Card title="대출 원금 상환 진행도">
        <p className="text-sm text-neutral-400 py-8 text-center">대출이 없는 시나리오입니다.</p>
      </Card>
    );
  }
  const data = result.projection.map((p) => ({
    year: `${p.year}년`,
    상환원금: Math.round(total - p.remainingLoan),
    잔여원금: Math.round(p.remainingLoan),
  }));
  return (
    <Card title="대출 원금 상환 진행도">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
            <Tooltip formatter={(v: number) => formatKRW(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="상환원금" stackId="a" fill={accent} radius={[0, 0, 0, 0]} />
            <Bar dataKey="잔여원금" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
