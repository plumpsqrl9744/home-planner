import { useScenarioStore } from '../../store/scenarioStore';
import { NumberInput } from '../ui/NumberInput';

const W = 10_000; // 만원 → 원

export function CommonInputs({ id }: { id: 'A' | 'B' }) {
  const common = useScenarioStore((s) => s.scenarios[id].common);
  const update = useScenarioStore((s) => s.updateCommon);
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInput label="보유 현금 (만원)" value={common.cash / W} step={100} onChange={(v) => update(id, { cash: v * W })} />
      <NumberInput label="부부합산 연소득 (만원)" value={common.annualIncome / W} step={100} onChange={(v) => update(id, { annualIncome: v * W })} />
      <NumberInput label="월 생활비 (만원)" value={common.monthlyLiving / W} step={10} onChange={(v) => update(id, { monthlyLiving: v * W })} />
      <NumberInput label="기존 신용대출 (만원)" value={common.creditLoan / W} step={100} onChange={(v) => update(id, { creditLoan: v * W })} />
    </div>
  );
}
