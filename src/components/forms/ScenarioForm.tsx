import type { BasicInfo } from '../../types/domain';
import { Card } from '../ui/Card';
import { HousingForm } from './HousingForm';
import { PolicyForm } from './PolicyForm';

/** 한 시나리오의 입력(주거 형태 + 정책). 공통 기본정보는 basic으로 주입받아 대출 상한 계산에 사용. */
export function ScenarioForm({ basic }: { basic: BasicInfo }) {
  return (
    <div className="space-y-4">
      <Card title="주거 형태 / 대출">
        <HousingForm basic={basic} />
      </Card>
      <Card title="정책 / 규제">
        <PolicyForm />
      </Card>
    </div>
  );
}
