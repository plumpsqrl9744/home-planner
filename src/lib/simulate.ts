import { calcPurchaseLoan } from './loan';
import { calcInitialCash } from './tax';
import { calcCashflow } from './cashflow';
import { buildProjection } from './projection';
import { PROJECTION_YEARS } from '../config/policy.config';
import type { Scenario } from '../types/domain';
import type { LoanResult, TaxResult, SimulationResult } from '../types/result';

const EMPTY_LOAN: LoanResult = {
  ltvCap: 0,
  dsrCap: 0,
  finalLoan: 0,
  monthlyPayment: 0,
  appliedLtvRatio: 0,
  reviewRate: 0,
};
const EMPTY_TAX: TaxResult = { acquisitionCost: 0, initialCashNeeded: 0 };

export function simulate(scenario: Scenario): SimulationResult {
  const { common, housing, policy, invest } = scenario;

  let loan: LoanResult = EMPTY_LOAN;
  let tax: TaxResult = EMPTY_TAX;
  let residualCash = common.cash;
  let realEstateValue0 = 0;
  let monthlyPayment = 0;
  let monthlyRent = 0;
  const managementFee = housing.managementFee;
  let projectionLoan = 0;
  let projectionLoanRate = 0;
  let projectionLoanMonths = 0;

  if (housing.type === 'purchase') {
    loan = calcPurchaseLoan(housing, common, policy);
    tax = calcInitialCash(housing, loan.finalLoan);
    residualCash = common.cash - tax.initialCashNeeded;
    realEstateValue0 = housing.price;
    monthlyPayment = loan.monthlyPayment;
    projectionLoan = loan.finalLoan;
    projectionLoanRate = housing.loanRate;
    projectionLoanMonths = housing.loanMaturityYears * 12;
  } else if (housing.type === 'jeonse') {
    const selfDeposit = housing.deposit - housing.loanLimit; // 자기부담 보증금
    residualCash = common.cash - selfDeposit;
    // 전세대출은 이자만 부담(만기 일시상환 가정) → 월이자 = 한도×금리/12
    monthlyPayment = (housing.loanLimit * housing.loanRate) / 12;
  } else {
    // happy
    residualCash = common.cash - housing.deposit;
    monthlyRent = housing.monthlyRent;
  }

  const cashflow = calcCashflow({
    annualIncome: common.annualIncome,
    monthlyLiving: common.monthlyLiving,
    monthlyPayment,
    monthlyRent,
    managementFee,
  });

  const projection = buildProjection({
    realEstateValue0,
    realEstateGrowthRate: invest.realEstateGrowthRate,
    loan: projectionLoan,
    loanRate: projectionLoanRate,
    loanMonths: projectionLoanMonths,
    residualCash,
    monthlySaving: cashflow.monthlySaving,
    etfRate: invest.etfReturnRate,
    years: PROJECTION_YEARS,
  });

  return { loan, tax, cashflow, projection, residualCash };
}
