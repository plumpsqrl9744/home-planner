import type { SimulationResult } from '../../types/result';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';

export function CashflowTable({ result }: { result: SimulationResult }) {
  const { cashflow } = result;
  const rows = [
    { label: '월 소득 (연소득/12)', value: cashflow.monthlyIncome, tone: 'text-neutral-800' },
    { label: '− 대출 원리금', value: -cashflow.breakdown.principalInterest, tone: 'text-danger-600' },
    { label: '− 월세', value: -cashflow.breakdown.rent, tone: 'text-danger-600' },
    { label: '− 관리비', value: -cashflow.breakdown.managementFee, tone: 'text-danger-600' },
  ];
  return (
    <Card title="월 현금 흐름표">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-neutral-50 last:border-0">
              <td className="py-2 text-neutral-500">{r.label}</td>
              <td className={`py-2 text-right font-medium ${r.tone}`}>{formatKRW(r.value)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-neutral-100">
            <td className="py-2.5 font-semibold text-neutral-700">월 순저축</td>
            <td
              className={`py-2.5 text-right font-bold ${
                cashflow.monthlySaving >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {formatKRW(cashflow.monthlySaving)}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
