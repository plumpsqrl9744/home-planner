export interface LoanResult {
  ltvCap: number; // LTV 기준 한도
  dsrCap: number; // DSR 기준 한도
  finalLoan: number; // min(ltvCap, dsrCap)
  monthlyPayment: number; // 실제 금리 기준 월 원리금
  appliedLtvRatio: number; // 적용된 LTV 비율
  reviewRate: number; // DSR 심사 금리 (스트레스 반영)
}

export interface TaxResult {
  acquisitionCost: number; // 취득세+부대비용
  initialCashNeeded: number; // 초기 필요 현금
}

export interface CashflowResult {
  monthlyFixedCost: number; // 원리금+월세+관리비
  monthlyIncome: number; // 연소득/12
  monthlySaving: number; // 순저축 (음수 가능)
  breakdown: { principalInterest: number; rent: number; managementFee: number };
}

export interface ProjectionPoint {
  year: number;
  realEstateValue: number; // 부동산 평가액
  financialAsset: number; // 금융자산
  remainingLoan: number; // 잔여 대출원금
  netWorth: number; // 순자산
}

export interface SimulationResult {
  loan: LoanResult;
  tax: TaxResult;
  cashflow: CashflowResult;
  projection: ProjectionPoint[];
  residualCash: number; // 거주 결정 후 투자에 투입되는 잔여 현금
}
