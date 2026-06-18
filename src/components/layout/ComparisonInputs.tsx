import { ScenarioPanel } from '../inputs/ScenarioPanel';
import { Card } from '../ui/Card';

export function ComparisonInputs() {
  return (
    <Card title="시나리오 입력 (A / B)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-primary-700 mb-3">시나리오 A</h4>
          <ScenarioPanel id="A" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-success-600 mb-3">시나리오 B</h4>
          <ScenarioPanel id="B" />
        </div>
      </div>
    </Card>
  );
}
