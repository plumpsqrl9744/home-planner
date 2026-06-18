import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import type { LeverageAnalysis } from '../../lib/leverage';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const ADVANTAGE_TEXT: Record<LeverageAnalysis['advantage'], { tone: 'primary' | 'danger' | 'neutral'; label: string; desc: string }> = {
  leverage: {
    tone: 'primary',
    label: '레버리지 유리',
    desc: '투자수익률이 대출금리보다 높아, 대출을 많이 받아 투자할수록 순자산이 커집니다.',
  },
  deleverage: {
    tone: 'danger',
    label: '대출 최소가 유리',
    desc: '대출금리가 투자수익률보다 높아, 대출을 줄이고 자기자본을 늘릴수록 유리합니다.',
  },
  neutral: {
    tone: 'neutral',
    label: '레버리지 효과 중립',
    desc: '대출금리와 투자수익률이 비슷해 대출 규모에 따른 순자산 차이가 크지 않습니다.',
  },
};

export function LeverageChart({ analysis, accent }: { analysis: LeverageAnalysis; accent: string }) {
  if (!analysis.applicable) {
    return (
      <Card title="레버리지 분석">
        <p className="text-sm text-neutral-400 py-8 text-center">
          레버리지 분석은 일반 매매 시나리오에서만 제공됩니다.
        </p>
      </Card>
    );
  }
  if (analysis.maxLoan <= 0) {
    return (
      <Card title="레버리지 분석">
        <p className="text-sm text-neutral-400 py-8 text-center">대출 가능 한도가 없어 분석할 수 없습니다.</p>
      </Card>
    );
  }

  const data = analysis.points.map((p) => ({
    loan: Math.round(p.loan),
    순자산: Math.round(p.netWorth),
  }));
  const info = ADVANTAGE_TEXT[analysis.advantage];
  const stableDiffers = analysis.stableOptimalLoan !== analysis.optimalLoan && analysis.stableOptimalNetWorth > 0;

  return (
    <Card
      title={`레버리지 분석 (${analysis.targetYear}년 후 순자산)`}
      actions={<Badge tone={info.tone}>{info.label}</Badge>}
    >
      <p className="text-xs text-neutral-500 mb-3 leading-relaxed">{info.desc}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="loan" tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} width={66} />
            <Tooltip
              formatter={(v: number) => formatKRW(v)}
              labelFormatter={(v: number) => `대출 ${formatKRW(v)}`}
            />
            <Line type="monotone" dataKey="순자산" stroke={accent} strokeWidth={2.5} dot={false} />
            <ReferenceDot x={Math.round(analysis.optimalLoan)} y={Math.round(analysis.optimalNetWorth)} r={5} fill={accent} stroke="#fff" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-primary-50 p-3">
          <p className="text-xs text-primary-700">순자산 최대 대출액</p>
          <p className="mt-0.5 font-bold text-primary-700">{formatKRW(analysis.optimalLoan)}</p>
          <p className="text-xs text-neutral-400">{analysis.targetYear}년 후 {formatKRW(analysis.optimalNetWorth)}</p>
        </div>
        {stableDiffers && (
          <div className="rounded-lg bg-success-500/10 p-3">
            <p className="text-xs text-success-600">월 흑자 유지 최대 대출액</p>
            <p className="mt-0.5 font-bold text-success-600">{formatKRW(analysis.stableOptimalLoan)}</p>
            <p className="text-xs text-neutral-400">{analysis.targetYear}년 후 {formatKRW(analysis.stableOptimalNetWorth)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
