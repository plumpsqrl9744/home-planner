import { useMemo } from 'react';
import { useScenarioStore } from '../../store/scenarioStore';
import { simulate } from '../../lib/simulate';
import { ScenarioPanel } from '../inputs/ScenarioPanel';
import { Dashboard } from '../dashboard/Dashboard';
import { CHART_COLORS } from '../../config/theme.config';

export function SingleView() {
  const scenarioA = useScenarioStore((s) => s.scenarios.A);
  const result = useMemo(() => simulate(scenarioA), [scenarioA]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      <aside>
        <ScenarioPanel id="A" />
      </aside>
      <main>
        <Dashboard result={result} accent={CHART_COLORS.A} />
      </main>
    </div>
  );
}
