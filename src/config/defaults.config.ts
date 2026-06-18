import type { Scenario } from '../types/domain';

export const HOUSING_LABELS: Record<string, string> = {
  happy: '행복주택(임대)',
  jeonse: '전세',
  purchase: '일반 매매',
};

export const DEFAULT_SCENARIO: Scenario = {
  label: '시나리오',
  common: {
    cash: 100_000_000,
    annualIncome: 70_000_000,
    monthlyLiving: 2_000_000,
    creditLoan: 0,
  },
  housing: {
    type: 'purchase',
    price: 600_000_000,
    loanRate: 0.04,
    loanMaturityYears: 30,
    managementFee: 150_000,
  },
  policy: {
    isFirstHome: true,
    stressDsr: false,
    districtCode: 'mapo',
  },
  invest: {
    etfReturnRate: 0.07,
    realEstateGrowthRate: 0.03,
  },
};
