export const POLICY = {
  dsrLimit: 0.4, // DSR 상한 40%
  stressRateAdd: 0.015, // 스트레스 가산 1.5%p
  acquisitionCostRate: 0.03, // 취득세+부대비용 3%
  ltv: {
    firstHome: { nonRegulated: 0.8, regulated: 0.6 },
    general: { nonRegulated: 0.7, regulated: 0.5 },
  },
  // 신용대출은 원금 전액(100%)을 만기로 분할하여 연간 원금상환액을 DSR 분자에 반영.
  // 실제 DSR 산정 관행과 동일(통상 5년 분할). 원금(stock)을 그대로 빼면 차원 오류.
  creditLoanDsrMaturityYears: 5,
} as const;

export const PROJECTION_YEARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
