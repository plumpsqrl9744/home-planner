import type { SimulationResult } from '../../types/result';
import { formatKRW, formatPercent } from '../../lib/format';
import { Card } from '../ui/Card';

export function SummaryCards({ result }: { result: SimulationResult }) {
  const last = result.projection[result.projection.length - 1];
  const items = [
    {
      label: '확정 대출액',
      value: formatKRW(result.loan.finalLoan),
      sub: result.loan.finalLoan > 0 ? `LTV ${formatPercent(result.loan.appliedLtvRatio)}` : '대출 없음',
    },
    {
      label: '초기 필요 현금',
      value: formatKRW(result.tax.initialCashNeeded || 0),
      sub: result.tax.acquisitionCost > 0 ? `부대비용 ${formatKRW(result.tax.acquisitionCost)}` : '—',
    },
    {
      label: '월 순저축',
      value: formatKRW(result.cashflow.monthlySaving),
      sub: `고정지출 ${formatKRW(result.cashflow.monthlyFixedCost)}`,
    },
    {
      label: `${last.year}년 후 순자산`,
      value: formatKRW(last.netWorth),
      sub: `부동산 ${formatKRW(last.realEstateValue)}`,
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <Card key={it.label} className="!p-0">
          <div className="p-4">
            <p className="text-xs text-neutral-400">{it.label}</p>
            <p className="mt-1 text-lg font-bold text-neutral-800">{it.value}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{it.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
