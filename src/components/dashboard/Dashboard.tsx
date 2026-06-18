import type { SimulationResult } from '../../types/result';
import { SummaryCards } from './SummaryCards';
import { NetWorthChart } from './NetWorthChart';
import { LoanProgressChart } from './LoanProgressChart';
import { CashflowTable } from './CashflowTable';

export function Dashboard({ result, accent }: { result: SimulationResult; accent: string }) {
  return (
    <div className="space-y-4">
      <SummaryCards result={result} />
      <NetWorthChart result={result} accent={accent} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LoanProgressChart result={result} accent={accent} />
        <CashflowTable result={result} />
      </div>
    </div>
  );
}
