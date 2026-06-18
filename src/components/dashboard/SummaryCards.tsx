import type { SimulationResult } from '../../types/result';
import { formatKRW, formatPercent } from '../../lib/format';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Item {
  label: string;
  value: string;
  sub: string;
}

function buildItems(result: SimulationResult): Item[] {
  const last = result.projection[result.projection.length - 1];
  const netWorthItem: Item = {
    label: `${last.year}년 후 순자산`,
    value: formatKRW(last.netWorth),
    sub:
      result.housingType === 'purchase'
        ? `부동산 ${formatKRW(last.realEstateValue)}`
        : `보증금 ${formatKRW(last.deposit)} 포함`,
  };
  const savingItem: Item = {
    label: '월 순저축',
    value: formatKRW(result.cashflow.monthlySaving),
    sub: `고정지출 ${formatKRW(result.cashflow.monthlyFixedCost)}`,
  };

  if (result.housingType === 'purchase') {
    return [
      {
        label: '확정 대출액',
        value: formatKRW(result.loan.finalLoan),
        sub: result.loan.finalLoan > 0 ? `LTV ${formatPercent(result.loan.appliedLtvRatio)}` : '대출 없음',
      },
      {
        label: '초기 필요 현금',
        value: formatKRW(result.tax.initialCashNeeded),
        sub: `부대비용 ${formatKRW(result.tax.acquisitionCost)} 포함`,
      },
      savingItem,
      netWorthItem,
    ];
  }

  // 전세 / 행복주택: 묶인 보증금이 핵심
  return [
    {
      label: '묶인 보증금(회수 가능)',
      value: formatKRW(result.lockedDeposit),
      sub: '퇴거·만기 시 돌려받는 자산',
    },
    {
      label: '투자 가용 현금',
      value: formatKRW(Math.max(0, result.residualCash)),
      sub: '보증금 제외 후 남은 현금',
    },
    savingItem,
    netWorthItem,
  ];
}

export function SummaryCards({ result }: { result: SimulationResult }) {
  const items = buildItems(result);
  return (
    <div className="space-y-3">
      {result.shortfall > 0 && (
        <div className="flex items-center gap-2 rounded-card border border-danger-500/30 bg-danger-500/5 px-4 py-2.5">
          <Badge tone="danger">자금 부족</Badge>
          <p className="text-sm text-neutral-600">
            초기 자금이 <span className="font-semibold text-danger-600">{formatKRW(result.shortfall)}</span> 부족합니다.
            현재 보유 현금으로는 이 시나리오를 실행할 수 없어요.
          </p>
        </div>
      )}
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
    </div>
  );
}
