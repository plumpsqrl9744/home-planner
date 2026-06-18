import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SimulationResult } from '../../types/result';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';

export function NetWorthChart({ result, accent }: { result: SimulationResult; accent: string }) {
  const data = result.projection.map((p) => ({ year: `${p.year}년`, 순자산: Math.round(p.netWorth) }));
  return (
    <Card title="순자산 시뮬레이션">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
            <Tooltip formatter={(v: number) => formatKRW(v)} />
            <Line type="monotone" dataKey="순자산" stroke={accent} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
