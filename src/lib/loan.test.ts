import { describe, it, expect } from 'vitest';
import {
  monthlyAmortization,
  loanFromMonthlyPayment,
  resolveLtvRatio,
  calcPurchaseLoan,
} from './loan';
import type { PurchaseInput, CommonInput, PolicyFlags } from '../types/domain';

describe('monthlyAmortization', () => {
  it('원리금균등 월납입금: 3억, 연4%, 30년 ≈ 1,432,250원', () => {
    const m = monthlyAmortization(300_000_000, 0.04, 360);
    expect(Math.round(m)).toBeGreaterThan(1_430_000);
    expect(Math.round(m)).toBeLessThan(1_435_000);
  });

  it('금리 0%면 원금/개월수', () => {
    expect(monthlyAmortization(120_000_000, 0, 120)).toBe(1_000_000);
  });

  it('원금 0이면 0', () => {
    expect(monthlyAmortization(0, 0.04, 360)).toBe(0);
  });
});

describe('loanFromMonthlyPayment (역산)', () => {
  it('월납입금 → 원금 역산은 monthlyAmortization의 역', () => {
    const principal = 300_000_000;
    const m = monthlyAmortization(principal, 0.04, 360);
    const back = loanFromMonthlyPayment(m, 0.04, 360);
    expect(Math.round(back)).toBeGreaterThan(principal - 1000);
    expect(Math.round(back)).toBeLessThan(principal + 1000);
  });

  it('금리 0%면 월납입금*개월수', () => {
    expect(loanFromMonthlyPayment(1_000_000, 0, 120)).toBe(120_000_000);
  });
});

describe('resolveLtvRatio', () => {
  it('생애최초 + 비규제 → 0.8', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    expect(resolveLtvRatio(policy)).toBe(0.8);
  });
  it('생애최초 + 규제(강남) → 0.6', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'gangnam' };
    expect(resolveLtvRatio(policy)).toBe(0.6);
  });
  it('일반 + 비규제 → 0.7', () => {
    const policy: PolicyFlags = { isFirstHome: false, stressDsr: false, districtCode: 'mapo' };
    expect(resolveLtvRatio(policy)).toBe(0.7);
  });
  it('일반 + 규제 → 0.5', () => {
    const policy: PolicyFlags = { isFirstHome: false, stressDsr: false, districtCode: 'gangnam' };
    expect(resolveLtvRatio(policy)).toBe(0.5);
  });
});

describe('calcPurchaseLoan', () => {
  const common: CommonInput = {
    cash: 100_000_000,
    annualIncome: 70_000_000,
    monthlyLiving: 2_000_000,
    creditLoan: 0,
  };
  const purchase: PurchaseInput = {
    type: 'purchase',
    price: 600_000_000,
    loanRate: 0.04,
    loanMaturityYears: 30,
    managementFee: 0,
  };

  it('확정 대출은 LTV와 DSR 중 작은 값', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    const r = calcPurchaseLoan(purchase, common, policy);
    expect(r.finalLoan).toBe(Math.min(r.ltvCap, r.dsrCap));
    expect(r.ltvCap).toBe(600_000_000 * 0.8);
  });

  it('스트레스 DSR 적용 시 심사금리가 가산되어 DSR 한도가 줄어든다', () => {
    const base: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    const stress: PolicyFlags = { isFirstHome: true, stressDsr: true, districtCode: 'mapo' };
    const rBase = calcPurchaseLoan(purchase, common, base);
    const rStress = calcPurchaseLoan(purchase, common, stress);
    expect(rStress.reviewRate).toBeCloseTo(0.04 + 0.015, 6);
    expect(rStress.dsrCap).toBeLessThan(rBase.dsrCap);
  });

  it('신용대출이 있으면 DSR 한도가 줄어든다 (단, 원금을 만기 분할 반영하므로 0이 되지 않음)', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    const withCredit: CommonInput = { ...common, creditLoan: 50_000_000 };
    const r0 = calcPurchaseLoan(purchase, common, policy);
    const r1 = calcPurchaseLoan(purchase, withCredit, policy);
    expect(r1.dsrCap).toBeLessThan(r0.dsrCap);
    // 신용대출 5천만/5년 = 연 1천만 부담. 연소득 7천×40%=2,800만 중 1,800만 남음 → 한도 양수여야 함
    expect(r1.dsrCap).toBeGreaterThan(0);
  });

  it('신용대출 연 분할부담이 DSR 허용액을 초과하면 한도 0', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    // 신용대출 2억/5년 = 연 4천만 > 연소득 7천×40%=2,800만 → 한도 0
    const heavy: CommonInput = { ...common, creditLoan: 200_000_000 };
    const r = calcPurchaseLoan(purchase, heavy, policy);
    expect(r.dsrCap).toBe(0);
  });

  it('월 원리금은 실제 금리 기준(스트레스 무관)으로 계산', () => {
    const stress: PolicyFlags = { isFirstHome: true, stressDsr: true, districtCode: 'mapo' };
    const r = calcPurchaseLoan(purchase, common, stress);
    const expected = monthlyAmortization(r.finalLoan, purchase.loanRate, purchase.loanMaturityYears * 12);
    expect(Math.round(r.monthlyPayment)).toBe(Math.round(expected));
  });
});
