import { useMemo } from 'react';
import { useScenarioStore } from '../../store/scenarioStore';
import { simulate } from '../../lib/simulate';
import { Dashboard } from '../dashboard/Dashboard';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CHART_COLORS } from '../../config/theme.config';
import { formatKRW } from '../../lib/format';
import { HOUSING_LABELS } from '../../config/defaults.config';

export function ComparisonView() {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const resultA = useMemo(() => simulate(scenarios.A), [scenarios.A]);
  const resultB = useMemo(() => simulate(scenarios.B), [scenarios.B]);

  const lastA = resultA.projection[resultA.projection.length - 1];
  const lastB = resultB.projection[resultB.projection.length - 1];
  const delta = lastA.netWorth - lastB.netWorth;
  const winner = delta >= 0 ? 'A' : 'B';

  return (
    <div className="space-y-4">
      <Card title="비교 요약">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge tone="primary">A · {HOUSING_LABELS[scenarios.A.housing.type]}</Badge>
            <span className="text-neutral-400">vs</span>
            <Badge tone="success">B · {HOUSING_LABELS[scenarios.B.housing.type]}</Badge>
          </div>
          <p className="text-sm text-neutral-600">
            {lastA.year}년 후 순자산 차이:{' '}
            <span className={`font-bold ${delta >= 0 ? 'text-primary-600' : 'text-success-600'}`}>
              시나리오 {winner}가 {formatKRW(Math.abs(delta))} 우위
            </span>
          </p>
        </div>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary-700">시나리오 A</h3>
          <Dashboard result={resultA} accent={CHART_COLORS.A} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-success-600">시나리오 B</h3>
          <Dashboard result={resultB} accent={CHART_COLORS.B} />
        </div>
      </div>
    </div>
  );
}
