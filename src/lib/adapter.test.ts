import { describe, it, expect } from 'vitest';
import { toScenario } from './adapter';
import type { BasicInfo, ScenarioConfig } from '../types/domain';

const basic: BasicInfo = {
  cash: 120_000_000,
  annualIncome: 70_000_000,
  monthlyLiving: 2_000_000,
  creditLoan: 10_000_000,
  etfReturnRate: 0.07,
  realEstateGrowthRate: 0.03,
};

const config: ScenarioConfig = {
  label: '시나리오 A',
  housing: { type: 'purchase', price: 600_000_000, desiredLoan: 400_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 150_000 },
  policy: { isFirstHome: true, stressDsr: false, districtCode: 'mapo' },
};

describe('toScenario', () => {
  it('공통 기본정보의 재무상태가 common으로 매핑된다', () => {
    const s = toScenario(basic, config);
    expect(s.common).toEqual({
      cash: 120_000_000,
      annualIncome: 70_000_000,
      monthlyLiving: 2_000_000,
      creditLoan: 10_000_000,
    });
  });

  it('공통 기본정보의 투자 가정이 invest로 매핑된다', () => {
    const s = toScenario(basic, config);
    expect(s.invest).toEqual({ etfReturnRate: 0.07, realEstateGrowthRate: 0.03 });
  });

  it('시나리오별 housing/policy/label은 그대로 전달된다', () => {
    const s = toScenario(basic, config);
    expect(s.housing).toBe(config.housing);
    expect(s.policy).toBe(config.policy);
    expect(s.label).toBe('시나리오 A');
  });

  it('같은 basic을 두 config에 합치면 공통 정보가 동일하게 반영된다(자동 반영)', () => {
    const configB: ScenarioConfig = { ...config, label: '시나리오 B', housing: { type: 'jeonse', deposit: 300_000_000, loanLimit: 0, loanRate: 0.035, managementFee: 0 } };
    const a = toScenario(basic, config);
    const b = toScenario(basic, configB);
    expect(a.common).toEqual(b.common);
    expect(a.invest).toEqual(b.invest);
  });
});
