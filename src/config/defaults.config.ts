import type { BasicInfo, HousingInput, HousingType, ScenarioConfig } from '../types/domain';

export const HOUSING_LABELS: Record<string, string> = {
  happy: '행복주택(임대)',
  jeonse: '전세',
  purchase: '일반 매매',
};

/** 공통 기본정보 기본값 (예: 현금 1.2억). */
export const DEFAULT_BASIC: BasicInfo = {
  cash: 120_000_000,
  annualIncome: 70_000_000,
  monthlyLiving: 2_000_000,
  creditLoan: 0,
  etfReturnRate: 0.07,
  realEstateGrowthRate: 0.03,
};

export function defaultHousing(type: HousingType): HousingInput {
  switch (type) {
    case 'happy':
      return { type: 'happy', deposit: 50_000_000, monthlyRent: 300_000, managementFee: 80_000 };
    case 'jeonse':
      return { type: 'jeonse', deposit: 400_000_000, loanLimit: 200_000_000, loanRate: 0.035, managementFee: 50_000 };
    case 'purchase':
      return {
        type: 'purchase',
        price: 600_000_000,
        desiredLoan: 480_000_000, // 기본은 상한 근처(LTV 80%). 슬라이더로 조절
        loanRate: 0.04,
        loanMaturityYears: 30,
        managementFee: 150_000,
      };
  }
}

export function makeScenarioConfig(label: string, type: HousingType): ScenarioConfig {
  return {
    label,
    housing: defaultHousing(type),
    policy: { isFirstHome: true, stressDsr: false, districtCode: 'mapo' },
  };
}
