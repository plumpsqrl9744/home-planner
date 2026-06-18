import { useScenarioStore } from '../../store/scenarioStore';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { DISTRICTS, getDistrict } from '../../config/districts.config';
import { POLICY } from '../../config/policy.config';
import { formatPercent } from '../../lib/format';

export function PolicyFilters({ id }: { id: 'A' | 'B' }) {
  const policy = useScenarioStore((s) => s.scenarios[id].policy);
  const housingType = useScenarioStore((s) => s.scenarios[id].housing.type);
  const update = useScenarioStore((s) => s.updatePolicy);
  const district = getDistrict(policy.districtCode);

  const districtOptions = DISTRICTS.map((d) => ({ value: d.code, label: d.name }));
  const stressAdd = formatPercent(POLICY.stressRateAdd);

  return (
    <div className="space-y-4">
      <Select
        label="자치구"
        value={policy.districtCode}
        options={districtOptions}
        onChange={(v) => update(id, { districtCode: v })}
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone={district.regulated ? 'danger' : 'success'}>
          {district.regulated ? '규제지역' : '비규제지역'}
        </Badge>
        {district.landTransactionPermit && <Badge tone="danger">토지거래허가구역</Badge>}
      </div>
      {housingType === 'purchase' && (
        <div className="space-y-3 pt-1">
          <Checkbox
            label="생애최초 주택구매"
            description="체크 시 비규제 LTV 80% 적용(규제지역은 한도 별도)"
            checked={policy.isFirstHome}
            onChange={(c) => update(id, { isFirstHome: c })}
          />
          <Checkbox
            label="스트레스 DSR 적용"
            description={`심사 금리 +${stressAdd} 가산하여 대출 한도 축소`}
            checked={policy.stressDsr}
            onChange={(c) => update(id, { stressDsr: c })}
          />
        </div>
      )}
    </div>
  );
}
