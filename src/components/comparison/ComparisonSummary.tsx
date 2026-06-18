import type { SimulationResult } from '../../types/result';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatKRW } from '../../lib/format';
import { HOUSING_LABELS } from '../../config/defaults.config';

export function ComparisonSummary({ resultA, resultB }: { resultA: SimulationResult; resultB: SimulationResult }) {
  const lastA = resultA.projection[resultA.projection.length - 1];
  const lastB = resultB.projection[resultB.projection.length - 1];
  const delta = lastA.netWorth - lastB.netWorth;
  const winner = delta >= 0 ? 'A' : 'B';

  return (
    <Card title="비교 요약">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Badge tone="primary">A · {HOUSING_LABELS[resultA.housingType]}</Badge>
          <span className="text-neutral-400">vs</span>
          <Badge tone="success">B · {HOUSING_LABELS[resultB.housingType]}</Badge>
        </div>
        <p className="text-sm text-neutral-600">
          {lastA.year}년 후 순자산 차이:{' '}
          <span className={`font-bold ${delta >= 0 ? 'text-primary-600' : 'text-success-600'}`}>
            시나리오 {winner}가 {formatKRW(Math.abs(delta))} 우위
          </span>
        </p>
      </div>
    </Card>
  );
}
