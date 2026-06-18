export const POLICY = {
  dsrLimit: 0.4, // DSR 상한 40%
  stressRateAdd: 0.015, // 스트레스 가산 1.5%p
  acquisitionCostRate: 0.03, // 취득세+부대비용 3%
  ltv: {
    firstHome: { nonRegulated: 0.8, regulated: 0.6 },
    general: { nonRegulated: 0.7, regulated: 0.5 },
  },
  creditLoanDsrFactor: 1.0, // 신용대출 원금 100% DSR 반영
} as const;

export const PROJECTION_YEARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
