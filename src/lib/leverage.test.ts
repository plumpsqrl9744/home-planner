import { describe, it, expect } from 'vitest';
import { analyzeLeverage } from './leverage';
import type { Scenario } from '../types/domain';

// cash를 집값+부대비용 이상으로 잡아 모든 대출 구간이 실행 가능하도록(순수 레버리지 효과만 관찰).
// 부동산상승률 0으로 두어 금융(투자−대출이자) 효과만 분리한다.
function makeScenario(etfRate: number, loanRate: number): Scenario {
  return {
    label: 'x',
    common: { cash: 700_000_000, annualIncome: 100_000_000, monthlyLiving: 2_000_000, creditLoan: 0 },
    housing: { type: 'purchase', price: 600_000_000, desiredLoan: 0, loanRate, loanMaturityYears: 30, managementFee: 0 },
    policy: { isFirstHome: true, stressDsr: false, districtCode: 'mapo' },
    invest: { etfReturnRate: etfRate, realEstateGrowthRate: 0.0 },
  };
}

describe('analyzeLeverage', () => {
  it('대출액 0부터 상한까지 스윕한 점들을 반환한다', () => {
    const a = analyzeLeverage(makeScenario(0.05, 0.04), 10);
    expect(a.points.length).toBeGreaterThan(2);
    expect(a.points[0].loan).toBe(0);
    expect(a.points[a.points.length - 1].loan).toBeCloseTo(a.maxLoan, 2);
  });

  it('★ 투자수익률 > 대출금리면 최적 대출액이 높다 (레버리지가 유리)', () => {
    const a = analyzeLeverage(makeScenario(0.08, 0.03), 10);
    // 빌린 돈으로 더 높은 수익을 내므로 대출을 많이 받을수록 순자산↑ → 최적은 상한 근처
    expect(a.optimalLoan).toBeGreaterThan(a.maxLoan * 0.8);
  });

  it('★ 투자수익률 < 대출금리면 최적 대출액이 낮다 (레버리지가 불리)', () => {
    const a = analyzeLeverage(makeScenario(0.02, 0.06), 10);
    // 이자가 수익보다 비싸므로 대출은 적을수록 유리 → 최적은 0 근처
    expect(a.optimalLoan).toBeLessThan(a.maxLoan * 0.2);
  });

  it('각 점은 순자산과 월 현금흐름 흑자 여부(feasible)를 가진다', () => {
    const a = analyzeLeverage(makeScenario(0.05, 0.04), 10);
    for (const p of a.points) {
      expect(typeof p.netWorth).toBe('number');
      expect(typeof p.feasible).toBe('boolean');
    }
  });

  it('매매가 아닌 시나리오는 분석 불가(points 비어있음)', () => {
    const jeonse: Scenario = {
      ...makeScenario(0.05, 0.04),
      housing: { type: 'jeonse', deposit: 300_000_000, loanLimit: 0, loanRate: 0.035, managementFee: 0 },
    };
    const a = analyzeLeverage(jeonse, 10);
    expect(a.points).toHaveLength(0);
    expect(a.applicable).toBe(false);
  });
});
