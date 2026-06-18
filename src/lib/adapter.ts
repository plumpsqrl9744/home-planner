import type { BasicInfo, Scenario, ScenarioConfig } from '../types/domain';

/** 공통 기본정보 + 시나리오별 설정을 합쳐 계산 엔진 입력(Scenario)으로 변환. */
export function toScenario(basic: BasicInfo, config: ScenarioConfig): Scenario {
  return {
    label: config.label,
    common: {
      cash: basic.cash,
      annualIncome: basic.annualIncome,
      monthlyLiving: basic.monthlyLiving,
      creditLoan: basic.creditLoan,
    },
    housing: config.housing,
    policy: config.policy,
    invest: {
      etfReturnRate: basic.etfReturnRate,
      realEstateGrowthRate: basic.realEstateGrowthRate,
    },
  };
}
