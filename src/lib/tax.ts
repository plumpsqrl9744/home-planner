import { POLICY } from '../config/policy.config';
import type { PurchaseInput } from '../types/domain';
import type { TaxResult } from '../types/result';

/** 취득세+중개수수료 등 부대비용 = 집값 × 부대비용율. */
export function calcAcquisitionCost(price: number): number {
  return price * POLICY.acquisitionCostRate;
}

/** 매매 초기 필요 현금 = 집값 − 확정 대출 + 부대비용. */
export function calcInitialCash(purchase: PurchaseInput, finalLoan: number): TaxResult {
  const acquisitionCost = calcAcquisitionCost(purchase.price);
  const initialCashNeeded = purchase.price - finalLoan + acquisitionCost;
  return { acquisitionCost, initialCashNeeded };
}
