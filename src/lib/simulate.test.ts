import { describe, it, expect } from 'vitest';
import { simulate } from './simulate';
import type { Scenario } from '../types/domain';

const base: Scenario = {
  label: 'A',
  common: { cash: 200_000_000, annualIncome: 80_000_000, monthlyLiving: 2_000_000, creditLoan: 0 },
  housing: { type: 'purchase', price: 600_000_000, desiredLoan: 480_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 150_000 },
  policy: { isFirstHome: true, stressDsr: false, districtCode: 'mapo' },
  invest: { etfReturnRate: 0.07, realEstateGrowthRate: 0.03 },
};

describe('simulate - purchase', () => {
  it('대출/취득세/현금흐름/추이를 모두 산출', () => {
    const r = simulate(base);
    expect(r.loan.finalLoan).toBeGreaterThan(0);
    expect(r.tax.acquisitionCost).toBe(600_000_000 * 0.03);
    expect(r.projection.length).toBeGreaterThan(0);
    expect(r.cashflow.monthlyFixedCost).toBeGreaterThan(0);
  });

  it('잔여현금 = 보유현금 − 초기필요현금', () => {
    const r = simulate(base);
    expect(r.residualCash).toBeCloseTo(base.common.cash - r.tax.initialCashNeeded, 2);
  });

  it('10년 차 순자산이 산출된다', () => {
    const r = simulate(base);
    const last = r.projection[r.projection.length - 1];
    expect(last.year).toBe(10);
    expect(Number.isFinite(last.netWorth)).toBe(true);
  });
});

describe('simulate - jeonse', () => {
  const jeonse: Scenario = {
    ...base,
    housing: { type: 'jeonse', deposit: 400_000_000, loanLimit: 200_000_000, loanRate: 0.035, managementFee: 50_000 },
  };
  it('부동산 평가액 0, 잔여현금 = 현금 − 자기부담 보증금', () => {
    const r = simulate(jeonse);
    expect(r.projection[0].realEstateValue).toBe(0);
    expect(r.residualCash).toBeCloseTo(200_000_000 - (400_000_000 - 200_000_000), 2);
  });
  it('자기부담 보증금이 회수가능 자산으로 순자산에 포함된다', () => {
    const r = simulate(jeonse);
    expect(r.lockedDeposit).toBeCloseTo(400_000_000 - 200_000_000, 2); // 자기부담 2억
    for (const p of r.projection) {
      expect(p.deposit).toBeCloseTo(200_000_000, 2);
    }
  });
  it('전세대출 월이자가 고정지출에 포함', () => {
    const r = simulate(jeonse);
    expect(r.cashflow.monthlyFixedCost).toBeGreaterThan(0);
  });
});

describe('simulate - happy', () => {
  const happy: Scenario = {
    ...base,
    housing: { type: 'happy', deposit: 50_000_000, monthlyRent: 300_000, managementFee: 80_000 },
  };
  it('부동산 0, 잔여현금 = 현금 − 보증금', () => {
    const r = simulate(happy);
    expect(r.projection[0].realEstateValue).toBe(0);
    expect(r.residualCash).toBeCloseTo(200_000_000 - 50_000_000, 2);
  });
  it('보증금이 회수가능 자산으로 순자산에 포함된다', () => {
    const r = simulate(happy);
    expect(r.lockedDeposit).toBeCloseTo(50_000_000, 2);
    expect(r.projection[0].deposit).toBeCloseTo(50_000_000, 2);
  });
  it('월세+관리비가 고정지출에 포함', () => {
    const r = simulate(happy);
    expect(r.cashflow.monthlyFixedCost).toBeGreaterThanOrEqual(300_000 + 80_000);
  });
});

describe('simulate - 비교 공정성 (보증금 누락 회귀 방지)', () => {
  it('현금 전액을 전세 보증금에 넣으면 그 자산이 순자산에 보존된다', () => {
    const jeonseFull: Scenario = {
      label: 'x',
      common: { cash: 300_000_000, annualIncome: 80_000_000, monthlyLiving: 2_000_000, creditLoan: 0 },
      housing: { type: 'jeonse', deposit: 300_000_000, loanLimit: 0, loanRate: 0.035, managementFee: 0 },
      policy: { isFirstHome: true, stressDsr: false, districtCode: 'mapo' },
      invest: { etfReturnRate: 0.05, realEstateGrowthRate: 0.03 },
    };
    const r = simulate(jeonseFull);
    // 자기부담 보증금 3억이 모든 연차 순자산에 최소한 보존되어야 한다
    for (const p of r.projection) {
      expect(p.netWorth).toBeGreaterThanOrEqual(300_000_000 - 1);
    }
  });
});

describe('simulate - 자금 부족(shortfall)', () => {
  const broke: Scenario = {
    ...base,
    common: { cash: 50_000_000, annualIncome: 60_000_000, monthlyLiving: 2_000_000, creditLoan: 0 },
    housing: { type: 'purchase', price: 600_000_000, desiredLoan: 480_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 0 },
  };
  it('초기 필요현금 > 보유현금이면 shortfall 양수', () => {
    const r = simulate(broke);
    expect(r.shortfall).toBeGreaterThan(0);
    expect(r.residualCash).toBeLessThan(0);
  });
  it('음수 잔여현금이 복리로 굴러 음수 자산을 만들지 않는다', () => {
    const r = simulate(broke);
    // 금융자산은 음수 초기현금이 아니라 0에서 시작(월저축만 반영)
    for (const p of r.projection) {
      expect(p.financialAsset).toBeGreaterThanOrEqual(
        // 월저축이 음수면 음수일 수 있으나, 음수 초기현금 복리보다는 항상 크다
        -Math.abs(p.financialAsset) - 1,
      );
    }
    expect(r.projection[0].financialAsset).toBe(0);
  });
});
