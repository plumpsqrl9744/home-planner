import { describe, it, expect } from 'vitest';
import { calcAcquisitionCost, calcInitialCash } from './tax';
import type { PurchaseInput } from '../types/domain';

describe('calcAcquisitionCost', () => {
  it('부대비용은 집값의 3%', () => {
    expect(calcAcquisitionCost(600_000_000)).toBe(18_000_000);
  });
});

describe('calcInitialCash', () => {
  const purchase: PurchaseInput = {
    type: 'purchase',
    price: 600_000_000,
    desiredLoan: 480_000_000,
    loanRate: 0.04,
    loanMaturityYears: 30,
    managementFee: 0,
  };
  it('초기 필요 현금 = 집값 − 대출 + 부대비용', () => {
    const r = calcInitialCash(purchase, 480_000_000);
    expect(r.acquisitionCost).toBe(18_000_000);
    expect(r.initialCashNeeded).toBe(600_000_000 - 480_000_000 + 18_000_000);
  });
});
