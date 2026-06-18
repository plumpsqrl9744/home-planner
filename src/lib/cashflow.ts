import type { CashflowResult } from '../types/result';

export function calcCashflow(params: {
  annualIncome: number;
  monthlyLiving: number;
  monthlyPayment: number;
  monthlyRent: number;
  managementFee: number;
}): CashflowResult {
  const { annualIncome, monthlyLiving, monthlyPayment, monthlyRent, managementFee } = params;
  const monthlyIncome = annualIncome / 12;
  const monthlyFixedCost = monthlyPayment + monthlyRent + managementFee;
  const monthlySaving = monthlyIncome - monthlyFixedCost - monthlyLiving;
  return {
    monthlyFixedCost,
    monthlyIncome,
    monthlySaving,
    breakdown: { principalInterest: monthlyPayment, rent: monthlyRent, managementFee },
  };
}
