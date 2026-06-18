import { describe, it, expect } from 'vitest';
import { calcCashflow } from './cashflow';

describe('calcCashflow', () => {
  it('월 고정지출 = 원리금 + 월세 + 관리비', () => {
    const r = calcCashflow({
      annualIncome: 60_000_000,
      monthlyLiving: 1_500_000,
      monthlyPayment: 1_000_000,
      monthlyRent: 300_000,
      managementFee: 100_000,
    });
    expect(r.monthlyFixedCost).toBe(1_400_000);
    expect(r.breakdown).toEqual({ principalInterest: 1_000_000, rent: 300_000, managementFee: 100_000 });
  });

  it('월 순저축 = 월소득 − 고정지출 − 생활비', () => {
    const r = calcCashflow({
      annualIncome: 60_000_000,
      monthlyLiving: 1_500_000,
      monthlyPayment: 1_000_000,
      monthlyRent: 0,
      managementFee: 0,
    });
    expect(r.monthlyIncome).toBe(5_000_000);
    expect(r.monthlySaving).toBe(5_000_000 - 1_000_000 - 1_500_000);
  });

  it('지출이 소득을 초과하면 순저축은 음수', () => {
    const r = calcCashflow({
      annualIncome: 24_000_000,
      monthlyLiving: 1_500_000,
      monthlyPayment: 1_000_000,
      monthlyRent: 0,
      managementFee: 0,
    });
    expect(r.monthlySaving).toBeLessThan(0);
  });
});
