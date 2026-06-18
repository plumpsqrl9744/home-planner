import { simulate } from './simulate';
import { calcPurchaseLoan } from './loan';
import type { Scenario } from '../types/domain';

export interface LeveragePoint {
  loan: number; // 대출액
  netWorth: number; // targetYear 시점 순자산
  monthlySaving: number; // 월 순저축(음수면 적자)
  feasible: boolean; // 자금 충분 && 월 현금흐름 흑자
}

export interface LeverageAnalysis {
  applicable: boolean; // 매매 시나리오에서만 분석 가능
  points: LeveragePoint[];
  maxLoan: number;
  targetYear: number;
  optimalLoan: number; // 순자산을 최대화하는 대출액
  optimalNetWorth: number;
  stableOptimalLoan: number; // 월 흑자를 유지하면서 순자산 최대인 대출액(없으면 0)
  stableOptimalNetWorth: number;
  advantage: 'leverage' | 'deleverage' | 'neutral'; // 금리 vs 수익률 해석
}

const STEPS = 21; // 0%, 5%, ... 100%

function netWorthAt(scenario: Scenario, year: number): { netWorth: number; monthlySaving: number; feasible: boolean } {
  const r = simulate(scenario);
  const p = r.projection.find((pt) => pt.year === year) ?? r.projection[r.projection.length - 1];
  const feasible = r.shortfall === 0 && r.cashflow.monthlySaving >= 0;
  return { netWorth: p.netWorth, monthlySaving: r.cashflow.monthlySaving, feasible };
}

/**
 * 대출액을 0~상한까지 바꿔가며 targetYear 순자산을 계산해 최적 레버리지를 찾는다.
 * 핵심: 투자수익률 > 대출금리면 대출을 늘릴수록 유리(leverage),
 *       투자수익률 < 대출금리면 줄일수록 유리(deleverage).
 */
export function analyzeLeverage(scenario: Scenario, targetYear: number): LeverageAnalysis {
  const empty: LeverageAnalysis = {
    applicable: false,
    points: [],
    maxLoan: 0,
    targetYear,
    optimalLoan: 0,
    optimalNetWorth: 0,
    stableOptimalLoan: 0,
    stableOptimalNetWorth: 0,
    advantage: 'neutral',
  };

  if (scenario.housing.type !== 'purchase') return empty;

  const housing = scenario.housing;
  const { maxLoan } = calcPurchaseLoan(housing, scenario.common, scenario.policy);
  if (maxLoan <= 0) return { ...empty, applicable: true };

  const points: LeveragePoint[] = [];
  for (let i = 0; i < STEPS; i++) {
    const loan = (maxLoan * i) / (STEPS - 1);
    const probe: Scenario = { ...scenario, housing: { ...housing, desiredLoan: loan } };
    const { netWorth, monthlySaving, feasible } = netWorthAt(probe, targetYear);
    points.push({ loan, netWorth, monthlySaving, feasible });
  }

  // 순자산 최대점
  let optimal = points[0];
  for (const p of points) if (p.netWorth > optimal.netWorth) optimal = p;

  // 월 흑자를 유지하는 점들 중 순자산 최대(안정 우선)
  const feasiblePoints = points.filter((p) => p.feasible);
  let stable = feasiblePoints[0];
  for (const p of feasiblePoints) if (!stable || p.netWorth > stable.netWorth) stable = p;

  // 금리 vs 수익률 해석: 0과 상한의 순자산 비교
  const first = points[0].netWorth;
  const last = points[points.length - 1].netWorth;
  const advantage: LeverageAnalysis['advantage'] =
    last > first * 1.001 ? 'leverage' : last < first * 0.999 ? 'deleverage' : 'neutral';

  return {
    applicable: true,
    points,
    maxLoan,
    targetYear,
    optimalLoan: optimal.loan,
    optimalNetWorth: optimal.netWorth,
    stableOptimalLoan: stable ? stable.loan : 0,
    stableOptimalNetWorth: stable ? stable.netWorth : 0,
    advantage,
  };
}
