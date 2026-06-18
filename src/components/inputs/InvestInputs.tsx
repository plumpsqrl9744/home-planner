import { useScenarioStore } from '../../store/scenarioStore';
import { NumberInput } from '../ui/NumberInput';

const P = 100; // % → 소수

export function InvestInputs({ id }: { id: 'A' | 'B' }) {
  const invest = useScenarioStore((s) => s.scenarios[id].invest);
  const update = useScenarioStore((s) => s.updateInvest);
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInput label="ETF 연수익률 (%)" value={invest.etfReturnRate * P} step={0.5} onChange={(v) => update(id, { etfReturnRate: v / P })} />
      <NumberInput label="부동산 연상승률 (%)" value={invest.realEstateGrowthRate * P} step={0.5} onChange={(v) => update(id, { realEstateGrowthRate: v / P })} />
    </div>
  );
}
