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
  deposit: number; // 잠긴 보증금 자산(전세 자기부담분/행복주택 보증금, 명목 유지·회수 가능)
  remainingLoan: number; // 잔여 대출원금
  netWorth: number; // 순자산
}

export interface SimulationResult {
  loan: LoanResult;
  tax: TaxResult;
  cashflow: CashflowResult;
  projection: ProjectionPoint[];
  residualCash: number; // 거주 결정 후 투자에 투입되는 잔여 현금(음수면 자금 부족)
  lockedDeposit: number; // 거주에 묶인 보증금 자산(회수 가능)
  shortfall: number; // 초기 자금 부족액(0이면 충분). 양수면 이 시나리오는 자금 부족
}
