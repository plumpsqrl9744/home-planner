import { Card } from '../ui/Card';
import { CommonInputs } from './CommonInputs';
import { HousingInputs } from './HousingInputs';
import { PolicyFilters } from './PolicyFilters';
import { InvestInputs } from './InvestInputs';

export function ScenarioPanel({ id }: { id: 'A' | 'B' }) {
  return (
    <div className="space-y-4">
      <Card title="주거 형태">
        <HousingInputs id={id} />
      </Card>
      <Card title="공통 입력">
        <CommonInputs id={id} />
      </Card>
      <Card title="정책 / 규제">
        <PolicyFilters id={id} />
      </Card>
      <Card title="투자 엔진">
        <InvestInputs id={id} />
      </Card>
    </div>
  );
}
