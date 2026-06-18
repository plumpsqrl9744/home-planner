import type { SimulationResult } from '../../types/result';
import type { LeverageAnalysis } from '../../lib/leverage';
import { SummaryCards } from './SummaryCards';
import { NetWorthChart } from './NetWorthChart';
import { LoanProgressChart } from './LoanProgressChart';
import { CashflowTable } from './CashflowTable';
import { LeverageChart } from './LeverageChart';

interface DashboardProps {
  result: SimulationResult;
  accent: string;
  leverage?: LeverageAnalysis;
}

export function Dashboard({ result, accent, leverage }: DashboardProps) {
  return (
    <div className="space-y-4">
      <SummaryCards result={result} />
      <NetWorthChart result={result} accent={accent} />
      {leverage && leverage.applicable && <LeverageChart analysis={leverage} accent={accent} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LoanProgressChart result={result} accent={accent} />
        <CashflowTable result={result} />
      </div>
    </div>
  );
}
