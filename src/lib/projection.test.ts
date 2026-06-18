import { describe, it, expect } from 'vitest';
import { compound, remainingPrincipal, accumulateSavings, buildProjection } from './projection';

describe('compound (연복리)', () => {
  it('1억, 연7%, 10년 = 1억×1.07^10', () => {
    expect(compound(100_000_000, 0.07, 10)).toBeCloseTo(100_000_000 * Math.pow(1.07, 10), 2);
  });
  it('0년이면 원금 그대로', () => {
    expect(compound(100_000_000, 0.07, 0)).toBe(100_000_000);
  });
});

describe('remainingPrincipal', () => {
  it('경과 0개월이면 대출 전액', () => {
    expect(remainingPrincipal(300_000_000, 0.04, 360, 0)).toBeCloseTo(300_000_000, 2);
  });
  it('만기 도달이면 잔액 0 근처', () => {
    const rem = remainingPrincipal(300_000_000, 0.04, 360, 360);
    expect(rem).toBeLessThan(1);
  });
  it('상환 진행에 따라 잔액 감소', () => {
    const a = remainingPrincipal(300_000_000, 0.04, 360, 60);
    const b = remainingPrincipal(300_000_000, 0.04, 360, 120);
    expect(b).toBeLessThan(a);
  });
  it('금리 0%면 선형 감소', () => {
    expect(remainingPrincipal(120_000_000, 0, 120, 60)).toBeCloseTo(60_000_000, 2);
  });
});

describe('accumulateSavings', () => {
  it('월저축 0이면 초기현금만 복리', () => {
    expect(accumulateSavings(50_000_000, 0, 0.07, 10)).toBeCloseTo(50_000_000 * Math.pow(1.07, 10), 2);
  });
  it('초기현금 0, 월저축만 적립 시 양수', () => {
    expect(accumulateSavings(0, 1_000_000, 0.07, 10)).toBeGreaterThan(0);
  });
  it('월저축이 음수면 적립분이 자산을 갉아먹는다', () => {
    const withNeg = accumulateSavings(100_000_000, -500_000, 0.05, 5);
    const flat = accumulateSavings(100_000_000, 0, 0.05, 5);
    expect(withNeg).toBeLessThan(flat);
  });
});

describe('buildProjection', () => {
  it('각 연차 순자산 = 부동산 + 금융 − 잔여대출', () => {
    const points = buildProjection({
      realEstateValue0: 600_000_000,
      realEstateGrowthRate: 0.03,
      loan: 400_000_000,
      loanRate: 0.04,
      loanMonths: 360,
      residualCash: 50_000_000,
      monthlySaving: 1_000_000,
      etfRate: 0.07,
      years: [0, 5, 10],
    });
    expect(points).toHaveLength(3);
    for (const p of points) {
      expect(p.netWorth).toBeCloseTo(p.realEstateValue + p.financialAsset - p.remainingLoan, 2);
    }
    expect(points[0].year).toBe(0);
    expect(points[2].realEstateValue).toBeCloseTo(600_000_000 * Math.pow(1.03, 10), 2);
  });
});
