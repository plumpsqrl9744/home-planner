import { useScenarioStore } from '../../store/scenarioStore';
import { NumberInput } from '../ui/NumberInput';
import { SegmentedControl } from '../ui/SegmentedControl';
import { HOUSING_LABELS } from '../../config/defaults.config';
import type { HousingType } from '../../types/domain';

const W = 10_000; // 만원 → 원
const P = 100; // % → 소수

const HOUSING_OPTIONS = (Object.keys(HOUSING_LABELS) as HousingType[]).map((t) => ({
  value: t,
  label: HOUSING_LABELS[t],
}));

export function HousingInputs({ id }: { id: 'A' | 'B' }) {
  const housing = useScenarioStore((s) => s.scenarios[id].housing);
  const setType = useScenarioStore((s) => s.setHousingType);
  const update = useScenarioStore((s) => s.updateHousing);

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={housing.type}
        options={HOUSING_OPTIONS}
        onChange={(v) => setType(id, v as HousingType)}
      />

      {housing.type === 'happy' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="보증금 (만원)" value={housing.deposit / W} step={100} onChange={(v) => update(id, { deposit: v * W })} />
          <NumberInput label="월세 (만원)" value={housing.monthlyRent / W} step={1} onChange={(v) => update(id, { monthlyRent: v * W })} />
          <NumberInput label="관리비 (만원)" value={housing.managementFee / W} step={1} onChange={(v) => update(id, { managementFee: v * W })} />
        </div>
      )}

      {housing.type === 'jeonse' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="전세 보증금 (만원)" value={housing.deposit / W} step={100} onChange={(v) => update(id, { deposit: v * W })} />
          <NumberInput label="전세자금대출 한도 (만원)" value={housing.loanLimit / W} step={100} onChange={(v) => update(id, { loanLimit: v * W })} />
          <NumberInput label="전세대출 금리 (%)" value={housing.loanRate * P} step={0.1} onChange={(v) => update(id, { loanRate: v / P })} />
          <NumberInput label="관리비 (만원)" value={housing.managementFee / W} step={1} onChange={(v) => update(id, { managementFee: v * W })} />
        </div>
      )}

      {housing.type === 'purchase' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="주택 가격 (만원)" value={housing.price / W} step={100} onChange={(v) => update(id, { price: v * W })} />
          <NumberInput label="주담대 금리 (%)" value={housing.loanRate * P} step={0.1} onChange={(v) => update(id, { loanRate: v / P })} />
          <NumberInput label="대출 만기 (년)" value={housing.loanMaturityYears} step={1} onChange={(v) => update(id, { loanMaturityYears: v })} />
          <NumberInput label="관리비 (만원)" value={housing.managementFee / W} step={1} onChange={(v) => update(id, { managementFee: v * W })} />
        </div>
      )}
    </div>
  );
}
