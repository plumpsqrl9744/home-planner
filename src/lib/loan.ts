import { POLICY } from '../config/policy.config';
import { getDistrict } from '../config/districts.config';
import type { PurchaseInput, CommonInput, PolicyFlags } from '../types/domain';
import type { LoanResult } from '../types/result';

/** 원리금균등상환 월 납입금. M = P·r·(1+r)^n / ((1+r)^n − 1) */
export function monthlyAmortization(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

/** 월 납입금으로부터 대출 원금 역산 (DSR 한도 산정용). */
export function loanFromMonthlyPayment(monthlyPayment: number, annualRate: number, months: number): number {
  if (monthlyPayment <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return monthlyPayment * months;
  const factor = Math.pow(1 + r, months);
  return (monthlyPayment * (factor - 1)) / (r * factor);
}

/** 정책 플래그로 적용 LTV 비율 결정. */
export function resolveLtvRatio(policy: PolicyFlags): number {
  const district = getDistrict(policy.districtCode);
  const table = policy.isFirstHome ? POLICY.ltv.firstHome : POLICY.ltv.general;
  return district.regulated ? table.regulated : table.nonRegulated;
}

/** 매매 대출: min(LTV 한도, DSR 한도). 월 원리금은 실제 금리 기준. */
export function calcPurchaseLoan(
  purchase: PurchaseInput,
  common: CommonInput,
  policy: PolicyFlags,
): LoanResult {
  const months = purchase.loanMaturityYears * 12;

  // LTV 한도
  const appliedLtvRatio = resolveLtvRatio(policy);
  const ltvCap = purchase.price * appliedLtvRatio;

  // DSR 한도: 심사금리(스트레스 가산) 기준 역산
  const reviewRate = purchase.loanRate + (policy.stressDsr ? POLICY.stressRateAdd : 0);
  const annualAllowance = common.annualIncome * POLICY.dsrLimit;
  // 기존 신용대출 연간 원금상환 반영(100%)
  const creditAnnualBurden = common.creditLoan * POLICY.creditLoanDsrFactor;
  const availableAnnual = Math.max(0, annualAllowance - creditAnnualBurden);
  const dsrCap = loanFromMonthlyPayment(availableAnnual / 12, reviewRate, months);

  const finalLoan = Math.min(ltvCap, dsrCap);
  const monthlyPayment = monthlyAmortization(finalLoan, purchase.loanRate, months);

  return { ltvCap, dsrCap, finalLoan, monthlyPayment, appliedLtvRatio, reviewRate };
}
