import { monthlyAmortization } from './loan';
import type { ProjectionPoint } from '../types/result';

/** 연복리: FV = PV × (1+r)^t */
export function compound(principal: number, rate: number, years: number): number {
  return principal * Math.pow(1 + rate, years);
}

/** 원리금균등 상환에서 경과 개월 시점의 잔여 원금. */
export function remainingPrincipal(
  loan: number,
  annualRate: number,
  totalMonths: number,
  elapsedMonths: number,
): number {
  if (loan <= 0) return 0;
  const m = Math.min(elapsedMonths, totalMonths);
  const r = annualRate / 12;
  if (r === 0) return Math.max(0, loan * (1 - m / totalMonths));
  const pay = monthlyAmortization(loan, annualRate, totalMonths);
  // 잔액 = 원금×(1+r)^m − 납입금×((1+r)^m − 1)/r
  const factor = Math.pow(1 + r, m);
  const balance = loan * factor - pay * ((factor - 1) / r);
  return Math.max(0, balance);
}

/**
 * 초기현금 + 매월 순저축 적립을 years년 후 금액으로.
 * 연복리 모델: 매년 (잔액×(1+r)) 후 그 해의 연 저축액(월저축×12)을 연말 합산.
 */
export function accumulateSavings(
  initialCash: number,
  monthlySaving: number,
  etfRate: number,
  years: number,
): number {
  const annualSaving = monthlySaving * 12;
  let balance = initialCash;
  for (let i = 0; i < years; i++) {
    balance = balance * (1 + etfRate) + annualSaving;
  }
  return balance;
}

export interface ProjectionParams {
  realEstateValue0: number;
  realEstateGrowthRate: number;
  loan: number;
  loanRate: number;
  loanMonths: number;
  residualCash: number;
  monthlySaving: number;
  etfRate: number;
  years: readonly number[];
}

export function buildProjection(params: ProjectionParams): ProjectionPoint[] {
  const {
    realEstateValue0,
    realEstateGrowthRate,
    loan,
    loanRate,
    loanMonths,
    residualCash,
    monthlySaving,
    etfRate,
    years,
  } = params;

  return years.map((year) => {
    const realEstateValue = compound(realEstateValue0, realEstateGrowthRate, year);
    const financialAsset = accumulateSavings(residualCash, monthlySaving, etfRate, year);
    const remainingLoan = remainingPrincipal(loan, loanRate, loanMonths, year * 12);
    const netWorth = realEstateValue + financialAsset - remainingLoan;
    return { year, realEstateValue, financialAsset, remainingLoan, netWorth };
  });
}
