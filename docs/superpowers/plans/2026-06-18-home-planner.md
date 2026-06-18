# 내 집 마련 & 자산 증식 통합 시뮬레이터 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2030 세대가 행복주택/전세/매매를 선택·비교하고 5·10년 후 순자산을 실시간 시뮬레이션하는 React SPA를 구현한다.

**Architecture:** 모든 금융 계산은 순수 함수(`lib/`)로 UI와 완전 분리하고 Vitest로 검증한다. 정책 수치는 `config/`로 전부 분리(하드코딩 0). Zustand 스토어가 시나리오 A/B 입력을 보유하고, 컴포넌트는 `simulate()`를 useMemo로 호출해 실시간 재계산한다.

**Tech Stack:** Vite + React 18 + TypeScript, Tailwind CSS, Zustand, Recharts, Vitest.

## Global Constraints

- 코드 내 정책 수치/매직넘버 하드코딩 0 — 모든 수치는 `src/config/`에서 import.
- 색상 코드 직접 작성 금지 — Tailwind 디자인 토큰 클래스만 사용. primary = `#2563eb`.
- 계산 엔진(`src/lib/`)은 UI/React 의존성 0인 순수 함수.
- 모든 `lib/` 함수는 Vitest 단위 테스트 동반(TDD).
- 패키지 매니저: npm. Node 18+.
- GitHub 원격: https://github.com/plumpsqrl9744/home-planner
- 통화 단위: 입력·계산은 모두 **원(KRW)** 정수 기준. 표시만 포맷.

---

### Task 1: 프로젝트 스캐폴딩 + 디자인 토큰 + 테스트 환경

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- Create: `tailwind.config.js`, `postcss.config.js`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `src/vite-env.d.ts`, `.gitignore`
- Test: `src/lib/__smoke__.test.ts`

**Interfaces:**
- Produces: 동작하는 Vite+React+TS+Tailwind 빌드, `npm test`로 Vitest 실행, 디자인 토큰 `primary`(50~900).

- [ ] **Step 1: Vite React-TS 프로젝트 생성**

```bash
cd "C:/Project/home-planner"
npm create vite@latest . -- --template react-ts
# 기존 docs/ 와 .git 은 유지. 덮어쓰기 프롬프트 시 기존 디렉토리 사용 선택.
npm install
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install zustand recharts
npm install -D tailwindcss@^3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: `tailwind.config.js` 디자인 토큰 정의**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        success: { 500: '#16a34a', 600: '#15803d' },
        danger: { 500: '#dc2626', 600: '#b91c1c' },
        neutral: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      borderRadius: { card: '0.75rem' },
      boxShadow: { card: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)' },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: `src/index.css` Tailwind 디렉티브 + 기본 스타일**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { @apply bg-neutral-50 text-neutral-800 antialiased; }
```

- [ ] **Step 5: `vite.config.ts`에 Vitest 설정 추가**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
```

Create `src/setupTests.ts`:
```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 6: `package.json` 스크립트에 test 추가**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 7: 스모크 테스트 작성**

`src/lib/__smoke__.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('테스트 환경이 동작한다', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: 테스트 실행 + 빌드 확인**

Run: `npm test`
Expected: PASS (1 test)

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "chore: Vite+React+TS+Tailwind 스캐폴딩 및 디자인 토큰 설정"
```

---

### Task 2: 도메인 타입 정의

**Files:**
- Create: `src/types/domain.ts`
- Create: `src/types/result.ts`

**Interfaces:**
- Produces: `HousingType`, `CommonInput`, `HappyInput`, `JeonseInput`, `PurchaseInput`, `HousingInput`, `PolicyFlags`, `InvestInput`, `Scenario`, `LoanResult`, `TaxResult`, `CashflowResult`, `ProjectionPoint`, `SimulationResult`.

- [ ] **Step 1: `src/types/domain.ts` 작성**

```ts
export type HousingType = 'happy' | 'jeonse' | 'purchase';

export interface CommonInput {
  cash: number;           // 보유 현금 (원)
  annualIncome: number;   // 부부합산 연소득 (원)
  monthlyLiving: number;  // 월 생활비 (원)
  creditLoan: number;     // 기존 신용대출 잔액 (원)
}

export interface HappyInput {
  type: 'happy';
  deposit: number;            // 보증금
  monthlyRent: number;        // 월세
  managementFee: number;      // 관리비(월)
  depositAdjustRate: number;  // 보증금 증액/감액 비율 (연, 소수: 0.05 = 5%)
  interestRate: number;       // 보증금 전환 이율 (연, 소수)
}

export interface JeonseInput {
  type: 'jeonse';
  deposit: number;       // 전세 보증금
  loanLimit: number;     // 전세자금대출 한도
  loanRate: number;      // 전세자금대출 금리 (연, 소수)
  managementFee: number; // 관리비(월)
}

export interface PurchaseInput {
  type: 'purchase';
  price: number;              // 주택 가격
  loanRate: number;           // 주담대 금리 (연, 소수)
  loanMaturityYears: number;  // 대출 만기 (년)
  managementFee: number;      // 관리비(월)
}

export type HousingInput = HappyInput | JeonseInput | PurchaseInput;

export interface PolicyFlags {
  isFirstHome: boolean;  // 생애최초 주택구매
  stressDsr: boolean;    // 스트레스 DSR 적용
  districtCode: string;  // 자치구 코드
}

export interface InvestInput {
  etfReturnRate: number;        // ETF 연수익률 (소수)
  realEstateGrowthRate: number; // 부동산 연상승률 (소수)
}

export interface Scenario {
  label: string;
  common: CommonInput;
  housing: HousingInput;
  policy: PolicyFlags;
  invest: InvestInput;
}
```

- [ ] **Step 2: `src/types/result.ts` 작성**

```ts
export interface LoanResult {
  ltvCap: number;          // LTV 기준 한도
  dsrCap: number;          // DSR 기준 한도
  finalLoan: number;       // min(ltvCap, dsrCap)
  monthlyPayment: number;  // 실제 금리 기준 월 원리금
  appliedLtvRatio: number; // 적용된 LTV 비율
  reviewRate: number;      // DSR 심사 금리 (스트레스 반영)
}

export interface TaxResult {
  acquisitionCost: number; // 취득세+부대비용
  initialCashNeeded: number; // 초기 필요 현금
}

export interface CashflowResult {
  monthlyFixedCost: number; // 원리금+월세+관리비
  monthlyIncome: number;    // 연소득/12
  monthlySaving: number;    // 순저축 (음수 가능)
  breakdown: { principalInterest: number; rent: number; managementFee: number };
}

export interface ProjectionPoint {
  year: number;
  realEstateValue: number;  // 부동산 평가액
  financialAsset: number;   // 금융자산
  remainingLoan: number;    // 잔여 대출원금
  netWorth: number;         // 순자산
}

export interface SimulationResult {
  loan: LoanResult;
  tax: TaxResult;
  cashflow: CashflowResult;
  projection: ProjectionPoint[];
  residualCash: number; // 거주 결정 후 투자에 투입되는 잔여 현금
}
```

- [ ] **Step 3: 타입 컴파일 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음

```bash
git add -A
git commit -m "feat: 도메인/결과 타입 정의"
```

---

### Task 3: 정책 config 분리 (하드코딩 0)

**Files:**
- Create: `src/config/policy.config.ts`
- Create: `src/config/districts.config.ts`
- Create: `src/config/defaults.config.ts`

**Interfaces:**
- Produces: `POLICY`, `DISTRICTS`, `getDistrict(code)`, `DEFAULT_SCENARIO`, `HOUSING_LABELS`, `PROJECTION_YEARS`.

- [ ] **Step 1: `src/config/policy.config.ts`**

```ts
export const POLICY = {
  dsrLimit: 0.4,            // DSR 상한 40%
  stressRateAdd: 0.015,    // 스트레스 가산 1.5%p
  acquisitionCostRate: 0.03, // 취득세+부대비용 3%
  ltv: {
    firstHome: { nonRegulated: 0.8, regulated: 0.6 },
    general:   { nonRegulated: 0.7, regulated: 0.5 },
  },
  creditLoanDsrFactor: 1.0, // 신용대출 원금 100% DSR 반영
} as const;

export const PROJECTION_YEARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
```

- [ ] **Step 2: `src/config/districts.config.ts`**

```ts
export interface District {
  code: string;
  name: string;
  regulated: boolean;            // 규제지역 여부
  landTransactionPermit: boolean; // 토지거래허가구역 여부
}

export const DISTRICTS: District[] = [
  { code: 'gangnam',  name: '강남구',   regulated: true,  landTransactionPermit: true },
  { code: 'seocho',   name: '서초구',   regulated: true,  landTransactionPermit: true },
  { code: 'songpa',   name: '송파구',   regulated: true,  landTransactionPermit: true },
  { code: 'yongsan',  name: '용산구',   regulated: true,  landTransactionPermit: true },
  { code: 'mapo',     name: '마포구',   regulated: false, landTransactionPermit: false },
  { code: 'seongdong',name: '성동구',   regulated: false, landTransactionPermit: false },
  { code: 'nowon',    name: '노원구',   regulated: false, landTransactionPermit: false },
  { code: 'etc',      name: '기타(비규제)', regulated: false, landTransactionPermit: false },
];

export function getDistrict(code: string): District {
  return DISTRICTS.find((d) => d.code === code) ?? DISTRICTS[DISTRICTS.length - 1];
}
```

- [ ] **Step 3: `src/config/defaults.config.ts`**

```ts
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
```

- [ ] **Step 4: 컴파일 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음

```bash
git add -A
git commit -m "feat: 정책/자치구/기본값 config 분리"
```

---

### Task 4: 대출 계산 엔진 (loan.ts) — TDD

**Files:**
- Create: `src/lib/loan.ts`
- Test: `src/lib/loan.test.ts`

**Interfaces:**
- Consumes: `POLICY` (config), `getDistrict` (config), `PurchaseInput`, `PolicyFlags`, `CommonInput`, `LoanResult`.
- Produces:
  - `monthlyAmortization(principal: number, annualRate: number, months: number): number`
  - `loanFromMonthlyPayment(monthlyPayment: number, annualRate: number, months: number): number`
  - `resolveLtvRatio(policy: PolicyFlags): number`
  - `calcPurchaseLoan(purchase: PurchaseInput, common: CommonInput, policy: PolicyFlags): LoanResult`

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/loan.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  monthlyAmortization,
  loanFromMonthlyPayment,
  resolveLtvRatio,
  calcPurchaseLoan,
} from './loan';
import type { PurchaseInput, CommonInput, PolicyFlags } from '../types/domain';

describe('monthlyAmortization', () => {
  it('원리금균등 월납입금: 3억, 연4%, 30년 ≈ 1,432,250원', () => {
    const m = monthlyAmortization(300_000_000, 0.04, 360);
    expect(Math.round(m)).toBeGreaterThan(1_430_000);
    expect(Math.round(m)).toBeLessThan(1_435_000);
  });

  it('금리 0%면 원금/개월수', () => {
    expect(monthlyAmortization(120_000_000, 0, 120)).toBe(1_000_000);
  });

  it('원금 0이면 0', () => {
    expect(monthlyAmortization(0, 0.04, 360)).toBe(0);
  });
});

describe('loanFromMonthlyPayment (역산)', () => {
  it('월납입금 → 원금 역산은 monthlyAmortization의 역', () => {
    const principal = 300_000_000;
    const m = monthlyAmortization(principal, 0.04, 360);
    const back = loanFromMonthlyPayment(m, 0.04, 360);
    expect(Math.round(back)).toBeGreaterThan(principal - 1000);
    expect(Math.round(back)).toBeLessThan(principal + 1000);
  });

  it('금리 0%면 월납입금*개월수', () => {
    expect(loanFromMonthlyPayment(1_000_000, 0, 120)).toBe(120_000_000);
  });
});

describe('resolveLtvRatio', () => {
  it('생애최초 + 비규제 → 0.8', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    expect(resolveLtvRatio(policy)).toBe(0.8);
  });
  it('생애최초 + 규제(강남) → 0.6', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'gangnam' };
    expect(resolveLtvRatio(policy)).toBe(0.6);
  });
  it('일반 + 비규제 → 0.7', () => {
    const policy: PolicyFlags = { isFirstHome: false, stressDsr: false, districtCode: 'mapo' };
    expect(resolveLtvRatio(policy)).toBe(0.7);
  });
  it('일반 + 규제 → 0.5', () => {
    const policy: PolicyFlags = { isFirstHome: false, stressDsr: false, districtCode: 'gangnam' };
    expect(resolveLtvRatio(policy)).toBe(0.5);
  });
});

describe('calcPurchaseLoan', () => {
  const common: CommonInput = { cash: 100_000_000, annualIncome: 70_000_000, monthlyLiving: 2_000_000, creditLoan: 0 };
  const purchase: PurchaseInput = { type: 'purchase', price: 600_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 0 };

  it('확정 대출은 LTV와 DSR 중 작은 값', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    const r = calcPurchaseLoan(purchase, common, policy);
    expect(r.finalLoan).toBe(Math.min(r.ltvCap, r.dsrCap));
    expect(r.ltvCap).toBe(600_000_000 * 0.8);
  });

  it('스트레스 DSR 적용 시 심사금리가 가산되어 DSR 한도가 줄어든다', () => {
    const base: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    const stress: PolicyFlags = { isFirstHome: true, stressDsr: true, districtCode: 'mapo' };
    const rBase = calcPurchaseLoan(purchase, common, base);
    const rStress = calcPurchaseLoan(purchase, common, stress);
    expect(rStress.reviewRate).toBeCloseTo(0.04 + 0.015, 6);
    expect(rStress.dsrCap).toBeLessThan(rBase.dsrCap);
  });

  it('신용대출이 있으면 DSR 한도가 줄어든다', () => {
    const policy: PolicyFlags = { isFirstHome: true, stressDsr: false, districtCode: 'mapo' };
    const withCredit: CommonInput = { ...common, creditLoan: 50_000_000 };
    const r0 = calcPurchaseLoan(purchase, common, policy);
    const r1 = calcPurchaseLoan(purchase, withCredit, policy);
    expect(r1.dsrCap).toBeLessThan(r0.dsrCap);
  });

  it('월 원리금은 실제 금리 기준(스트레스 무관)으로 계산', () => {
    const stress: PolicyFlags = { isFirstHome: true, stressDsr: true, districtCode: 'mapo' };
    const r = calcPurchaseLoan(purchase, common, stress);
    const expected = monthlyAmortization(r.finalLoan, purchase.loanRate, purchase.loanMaturityYears * 12);
    expect(Math.round(r.monthlyPayment)).toBe(Math.round(expected));
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/loan.test.ts`
Expected: FAIL (loan.ts 미존재 / 함수 undefined)

- [ ] **Step 3: `src/lib/loan.ts` 구현**

```ts
import { POLICY } from '../config/policy.config';
import { getDistrict } from '../config/districts.config';
import type { PurchaseInput, CommonInput, PolicyFlags } from '../types/domain';
import type { LoanResult } from '../types/result';

/** 원리금균등상환 월 납입금. M = P·r·(1+r)^n / ((1+r)^n − 1) */
export function monthlyAmortization(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

/** 월 납입금으로부터 대출 원금 역산 (DSR 한도 산정용). */
export function loanFromMonthlyPayment(monthlyPayment: number, annualRate: number, months: number): number {
  if (monthlyPayment <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return monthlyPayment * months;
  const factor = Math.pow(1 + r, months);
  return (monthlyPayment * (factor - 1)) / (r * factor);
}

/** 정책 플래그로 적용 LTV 비율 결정. */
export function resolveLtvRatio(policy: PolicyFlags): number {
  const district = getDistrict(policy.districtCode);
  const table = policy.isFirstHome ? POLICY.ltv.firstHome : POLICY.ltv.general;
  return district.regulated ? table.regulated : table.nonRegulated;
}

/** 매매 대출: min(LTV 한도, DSR 한도). 월 원리금은 실제 금리 기준. */
export function calcPurchaseLoan(
  purchase: PurchaseInput,
  common: CommonInput,
  policy: PolicyFlags,
): LoanResult {
  const months = purchase.loanMaturityYears * 12;

  // LTV 한도
  const appliedLtvRatio = resolveLtvRatio(policy);
  const ltvCap = purchase.price * appliedLtvRatio;

  // DSR 한도: 심사금리(스트레스 가산) 기준 역산
  const reviewRate = purchase.loanRate + (policy.stressDsr ? POLICY.stressRateAdd : 0);
  const annualAllowance = common.annualIncome * POLICY.dsrLimit;
  // 기존 신용대출 연간 원금상환 반영(100%)
  const creditAnnualBurden = common.creditLoan * POLICY.creditLoanDsrFactor;
  const availableAnnual = Math.max(0, annualAllowance - creditAnnualBurden);
  const dsrCap = loanFromMonthlyPayment(availableAnnual / 12, reviewRate, months);

  const finalLoan = Math.min(ltvCap, dsrCap);
  const monthlyPayment = monthlyAmortization(finalLoan, purchase.loanRate, months);

  return { ltvCap, dsrCap, finalLoan, monthlyPayment, appliedLtvRatio, reviewRate };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/loan.test.ts`
Expected: PASS (전체 통과)

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 대출 계산 엔진(원리금균등/LTV/DSR/min 확정) + 테스트"
```

---

### Task 5: 취득세·부대비용 엔진 (tax.ts) — TDD

**Files:**
- Create: `src/lib/tax.ts`
- Test: `src/lib/tax.test.ts`

**Interfaces:**
- Consumes: `POLICY`, `PurchaseInput`, `TaxResult`.
- Produces:
  - `calcAcquisitionCost(price: number): number`
  - `calcInitialCash(purchase: PurchaseInput, finalLoan: number): TaxResult`

- [ ] **Step 1: 실패 테스트**

`src/lib/tax.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { calcAcquisitionCost, calcInitialCash } from './tax';
import type { PurchaseInput } from '../types/domain';

describe('calcAcquisitionCost', () => {
  it('부대비용은 집값의 3%', () => {
    expect(calcAcquisitionCost(600_000_000)).toBe(18_000_000);
  });
});

describe('calcInitialCash', () => {
  const purchase: PurchaseInput = { type: 'purchase', price: 600_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 0 };
  it('초기 필요 현금 = 집값 − 대출 + 부대비용', () => {
    const r = calcInitialCash(purchase, 480_000_000);
    expect(r.acquisitionCost).toBe(18_000_000);
    expect(r.initialCashNeeded).toBe(600_000_000 - 480_000_000 + 18_000_000);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/tax.test.ts`
Expected: FAIL

- [ ] **Step 3: `src/lib/tax.ts` 구현**

```ts
import { POLICY } from '../config/policy.config';
import type { PurchaseInput } from '../types/domain';
import type { TaxResult } from '../types/result';

/** 취득세+중개수수료 등 부대비용 = 집값 × 부대비용율. */
export function calcAcquisitionCost(price: number): number {
  return price * POLICY.acquisitionCostRate;
}

/** 매매 초기 필요 현금 = 집값 − 확정 대출 + 부대비용. */
export function calcInitialCash(purchase: PurchaseInput, finalLoan: number): TaxResult {
  const acquisitionCost = calcAcquisitionCost(purchase.price);
  const initialCashNeeded = purchase.price - finalLoan + acquisitionCost;
  return { acquisitionCost, initialCashNeeded };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/tax.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 취득세/부대비용 및 초기 필요현금 계산 + 테스트"
```

---

### Task 6: 현금흐름 엔진 (cashflow.ts) — TDD

**Files:**
- Create: `src/lib/cashflow.ts`
- Test: `src/lib/cashflow.test.ts`

**Interfaces:**
- Consumes: `CommonInput`, `CashflowResult`.
- Produces:
  - `calcCashflow(params: { annualIncome: number; monthlyLiving: number; monthlyPayment: number; monthlyRent: number; managementFee: number }): CashflowResult`

- [ ] **Step 1: 실패 테스트**

`src/lib/cashflow.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { calcCashflow } from './cashflow';

describe('calcCashflow', () => {
  it('월 고정지출 = 원리금 + 월세 + 관리비', () => {
    const r = calcCashflow({ annualIncome: 60_000_000, monthlyLiving: 1_500_000, monthlyPayment: 1_000_000, monthlyRent: 300_000, managementFee: 100_000 });
    expect(r.monthlyFixedCost).toBe(1_400_000);
    expect(r.breakdown).toEqual({ principalInterest: 1_000_000, rent: 300_000, managementFee: 100_000 });
  });

  it('월 순저축 = 월소득 − 고정지출 − 생활비', () => {
    const r = calcCashflow({ annualIncome: 60_000_000, monthlyLiving: 1_500_000, monthlyPayment: 1_000_000, monthlyRent: 0, managementFee: 0 });
    expect(r.monthlyIncome).toBe(5_000_000);
    expect(r.monthlySaving).toBe(5_000_000 - 1_000_000 - 1_500_000);
  });

  it('지출이 소득을 초과하면 순저축은 음수', () => {
    const r = calcCashflow({ annualIncome: 24_000_000, monthlyLiving: 1_500_000, monthlyPayment: 1_000_000, monthlyRent: 0, managementFee: 0 });
    expect(r.monthlySaving).toBeLessThan(0);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/cashflow.test.ts`
Expected: FAIL

- [ ] **Step 3: `src/lib/cashflow.ts` 구현**

```ts
import type { CashflowResult } from '../types/result';

export function calcCashflow(params: {
  annualIncome: number;
  monthlyLiving: number;
  monthlyPayment: number;
  monthlyRent: number;
  managementFee: number;
}): CashflowResult {
  const { annualIncome, monthlyLiving, monthlyPayment, monthlyRent, managementFee } = params;
  const monthlyIncome = annualIncome / 12;
  const monthlyFixedCost = monthlyPayment + monthlyRent + managementFee;
  const monthlySaving = monthlyIncome - monthlyFixedCost - monthlyLiving;
  return {
    monthlyFixedCost,
    monthlyIncome,
    monthlySaving,
    breakdown: { principalInterest: monthlyPayment, rent: monthlyRent, managementFee },
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/cashflow.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 현금흐름(고정지출/순저축) 계산 + 테스트"
```

---

### Task 7: 자산 시뮬레이션 엔진 (projection.ts) — TDD

**Files:**
- Create: `src/lib/projection.ts`
- Test: `src/lib/projection.test.ts`

**Interfaces:**
- Consumes: `monthlyAmortization` (loan.ts), `POLICY`/`PROJECTION_YEARS` (config), `ProjectionPoint`.
- Produces:
  - `compound(principal: number, rate: number, years: number): number`
  - `remainingPrincipal(loan: number, annualRate: number, totalMonths: number, elapsedMonths: number): number`
  - `accumulateSavings(initialCash: number, monthlySaving: number, etfRate: number, years: number): number`
  - `buildProjection(params: ProjectionParams): ProjectionPoint[]`
  - `interface ProjectionParams { realEstateValue0: number; realEstateGrowthRate: number; loan: number; loanRate: number; loanMonths: number; residualCash: number; monthlySaving: number; etfRate: number; years: readonly number[] }`

- [ ] **Step 1: 실패 테스트**

`src/lib/projection.test.ts`:
```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/projection.test.ts`
Expected: FAIL

- [ ] **Step 3: `src/lib/projection.ts` 구현**

```ts
import { monthlyAmortization } from './loan';
import type { ProjectionPoint } from '../types/result';

/** 연복리: FV = PV × (1+r)^t */
export function compound(principal: number, rate: number, years: number): number {
  return principal * Math.pow(1 + rate, years);
}

/** 원리금균등 상환에서 경과 개월 시점의 잔여 원금. */
export function remainingPrincipal(
  loan: number,
  annualRate: number,
  totalMonths: number,
  elapsedMonths: number,
): number {
  if (loan <= 0) return 0;
  const m = Math.min(elapsedMonths, totalMonths);
  const r = annualRate / 12;
  if (r === 0) return Math.max(0, loan * (1 - m / totalMonths));
  const pay = monthlyAmortization(loan, annualRate, totalMonths);
  // 잔액 = 원금×(1+r)^m − 납입금×((1+r)^m − 1)/r
  const factor = Math.pow(1 + r, m);
  const balance = loan * factor - pay * ((factor - 1) / r);
  return Math.max(0, balance);
}

/** 초기현금 복리 + 매월 순저축 적립(월 복리)을 years년 후 금액으로. */
export function accumulateSavings(
  initialCash: number,
  monthlySaving: number,
  etfRate: number,
  years: number,
): number {
  const months = Math.round(years * 12);
  const monthlyRate = etfRate / 12;
  let balance = initialCash;
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthlySaving;
  }
  return balance;
}

export interface ProjectionParams {
  realEstateValue0: number;
  realEstateGrowthRate: number;
  loan: number;
  loanRate: number;
  loanMonths: number;
  residualCash: number;
  monthlySaving: number;
  etfRate: number;
  years: readonly number[];
}

export function buildProjection(params: ProjectionParams): ProjectionPoint[] {
  const {
    realEstateValue0, realEstateGrowthRate, loan, loanRate, loanMonths,
    residualCash, monthlySaving, etfRate, years,
  } = params;

  return years.map((year) => {
    const realEstateValue = compound(realEstateValue0, realEstateGrowthRate, year);
    const financialAsset = accumulateSavings(residualCash, monthlySaving, etfRate, year);
    const remainingLoan = remainingPrincipal(loan, loanRate, loanMonths, year * 12);
    const netWorth = realEstateValue + financialAsset - remainingLoan;
    return { year, realEstateValue, financialAsset, remainingLoan, netWorth };
  });
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/projection.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 자산 시뮬레이션(연복리/잔여원금/순자산 추이) + 테스트"
```

---

### Task 8: 시나리오 조합 엔진 (simulate.ts) — TDD

**Files:**
- Create: `src/lib/simulate.ts`
- Test: `src/lib/simulate.test.ts`

**Interfaces:**
- Consumes: 모든 `lib/` 함수, `Scenario`, `SimulationResult`, `PROJECTION_YEARS`.
- Produces: `simulate(scenario: Scenario): SimulationResult`

주거 형태별 처리:
- **purchase**: 대출/취득세 계산, 부동산 평가액 = 집값, 잔여현금 = 보유현금 − 초기필요현금.
- **jeonse**: 대출 없음(전세대출은 월이자만 고정지출에 반영), 부동산 평가액 0, 잔여현금 = 보유현금 − (전세보증금 − 전세대출).
- **happy**: 부동산 0, 잔여현금 = 보유현금 − 보증금, 월세+관리비 고정지출.

- [ ] **Step 1: 실패 테스트**

`src/lib/simulate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { simulate } from './simulate';
import type { Scenario } from '../types/domain';

const base: Scenario = {
  label: 'A',
  common: { cash: 200_000_000, annualIncome: 80_000_000, monthlyLiving: 2_000_000, creditLoan: 0 },
  housing: { type: 'purchase', price: 600_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 150_000 },
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
  it('전세대출 월이자가 고정지출에 포함', () => {
    const r = simulate(jeonse);
    expect(r.cashflow.monthlyFixedCost).toBeGreaterThan(0);
  });
});

describe('simulate - happy', () => {
  const happy: Scenario = {
    ...base,
    housing: { type: 'happy', deposit: 50_000_000, monthlyRent: 300_000, managementFee: 80_000, depositAdjustRate: 0.05, interestRate: 0.025 },
  };
  it('부동산 0, 잔여현금 = 현금 − 보증금', () => {
    const r = simulate(happy);
    expect(r.projection[0].realEstateValue).toBe(0);
    expect(r.residualCash).toBeCloseTo(200_000_000 - 50_000_000, 2);
  });
  it('월세+관리비가 고정지출에 포함', () => {
    const r = simulate(happy);
    expect(r.cashflow.monthlyFixedCost).toBeGreaterThanOrEqual(300_000 + 80_000);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/simulate.test.ts`
Expected: FAIL

- [ ] **Step 3: `src/lib/simulate.ts` 구현**

```ts
import { calcPurchaseLoan, monthlyAmortization } from './loan';
import { calcInitialCash } from './tax';
import { calcCashflow } from './cashflow';
import { buildProjection } from './projection';
import { PROJECTION_YEARS } from '../config/policy.config';
import type { Scenario } from '../types/domain';
import type { LoanResult, TaxResult, SimulationResult } from '../types/result';

const EMPTY_LOAN: LoanResult = {
  ltvCap: 0, dsrCap: 0, finalLoan: 0, monthlyPayment: 0, appliedLtvRatio: 0, reviewRate: 0,
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
  let managementFee = housing.managementFee;
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
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/simulate.test.ts`
Expected: PASS

- [ ] **Step 5: 전체 테스트 + 커밋**

Run: `npm test`
Expected: 전체 PASS

```bash
git add -A
git commit -m "feat: 시나리오 조합 시뮬레이션 엔진 + 테스트"
```

---

### Task 9: 포맷 유틸 + Zustand 스토어

**Files:**
- Create: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`
- Create: `src/store/scenarioStore.ts`

**Interfaces:**
- Produces:
  - `formatKRW(value: number): string` (예: `6.0억`, `1,500만`)
  - `formatPercent(rate: number): string`
  - `useScenarioStore` — state `{ scenarios: { A; B }, comparisonMode }`, actions `updateCommon`, `updateInvest`, `updatePolicy`, `setHousingType`, `updateHousing`, `toggleComparison`.

- [ ] **Step 1: format 실패 테스트**

`src/lib/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatKRW, formatPercent } from './format';

describe('formatKRW', () => {
  it('억 단위', () => { expect(formatKRW(600_000_000)).toBe('6억'); });
  it('억+만 단위', () => { expect(formatKRW(615_000_000)).toBe('6억 1,500만'); });
  it('만 단위', () => { expect(formatKRW(15_000_000)).toBe('1,500만'); });
  it('0', () => { expect(formatKRW(0)).toBe('0원'); });
  it('음수', () => { expect(formatKRW(-15_000_000)).toBe('-1,500만'); });
});

describe('formatPercent', () => {
  it('소수를 %로', () => { expect(formatPercent(0.04)).toBe('4%'); });
  it('소수점 한자리', () => { expect(formatPercent(0.035)).toBe('3.5%'); });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/format.test.ts`
Expected: FAIL

- [ ] **Step 3: `src/lib/format.ts` 구현**

```ts
/** 원 단위 숫자를 억/만 한글 단위로 포맷. */
export function formatKRW(value: number): string {
  if (value === 0) return '0원';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(Math.round(value));
  const eok = Math.floor(abs / 100_000_000);
  const man = Math.floor((abs % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`);
  if (parts.length === 0) return `${sign}${abs.toLocaleString('ko-KR')}원`;
  return `${sign}${parts.join(' ')}`;
}

/** 소수 비율을 % 문자열로(최대 소수 1자리). */
export function formatPercent(rate: number): string {
  const pct = rate * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded}%`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/format.test.ts`
Expected: PASS

- [ ] **Step 5: `src/store/scenarioStore.ts` 구현**

```ts
import { create } from 'zustand';
import type {
  Scenario, CommonInput, InvestInput, PolicyFlags, HousingType, HousingInput,
} from '../types/domain';
import { DEFAULT_SCENARIO } from '../config/defaults.config';

type ScenarioId = 'A' | 'B';

function makeDefault(label: string, type: HousingType): Scenario {
  return { ...structuredClone(DEFAULT_SCENARIO), label, housing: defaultHousing(type) };
}

function defaultHousing(type: HousingType): HousingInput {
  switch (type) {
    case 'happy':
      return { type: 'happy', deposit: 50_000_000, monthlyRent: 300_000, managementFee: 80_000, depositAdjustRate: 0.05, interestRate: 0.025 };
    case 'jeonse':
      return { type: 'jeonse', deposit: 400_000_000, loanLimit: 200_000_000, loanRate: 0.035, managementFee: 50_000 };
    case 'purchase':
      return { type: 'purchase', price: 600_000_000, loanRate: 0.04, loanMaturityYears: 30, managementFee: 150_000 };
  }
}

interface ScenarioState {
  scenarios: Record<ScenarioId, Scenario>;
  comparisonMode: boolean;
  updateCommon: (id: ScenarioId, patch: Partial<CommonInput>) => void;
  updateInvest: (id: ScenarioId, patch: Partial<InvestInput>) => void;
  updatePolicy: (id: ScenarioId, patch: Partial<PolicyFlags>) => void;
  setHousingType: (id: ScenarioId, type: HousingType) => void;
  updateHousing: (id: ScenarioId, patch: Record<string, number>) => void;
  toggleComparison: () => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: {
    A: makeDefault('시나리오 A', 'purchase'),
    B: makeDefault('시나리오 B', 'jeonse'),
  },
  comparisonMode: false,
  updateCommon: (id, patch) => set((s) => ({
    scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], common: { ...s.scenarios[id].common, ...patch } } },
  })),
  updateInvest: (id, patch) => set((s) => ({
    scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], invest: { ...s.scenarios[id].invest, ...patch } } },
  })),
  updatePolicy: (id, patch) => set((s) => ({
    scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], policy: { ...s.scenarios[id].policy, ...patch } } },
  })),
  setHousingType: (id, type) => set((s) => ({
    scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], housing: defaultHousing(type) } },
  })),
  updateHousing: (id, patch) => set((s) => ({
    scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], housing: { ...s.scenarios[id].housing, ...patch } as HousingInput } },
  })),
  toggleComparison: () => set((s) => ({ comparisonMode: !s.comparisonMode })),
}));
```

- [ ] **Step 6: 컴파일 + 테스트 + 커밋**

Run: `npx tsc --noEmit && npm test`
Expected: 에러 없음, 전체 PASS

```bash
git add -A
git commit -m "feat: 포맷 유틸 + Zustand 시나리오 스토어"
```

---

### Task 10: UI 프리미티브 컴포넌트

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/NumberInput.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/Checkbox.tsx`
- Create: `src/components/ui/SegmentedControl.tsx`
- Create: `src/components/ui/Badge.tsx`

**Interfaces:**
- Produces: 디자인 토큰 클래스만 사용하는 재사용 프리미티브.
  - `Card({ title?, children, className? })`
  - `NumberInput({ label, value, onChange, suffix?, step?, min? })` — onChange는 number 전달
  - `Select({ label, value, options: {value,label}[], onChange })`
  - `Checkbox({ label, checked, onChange, description? })`
  - `SegmentedControl({ value, options, onChange })`
  - `Badge({ children, tone?: 'primary'|'success'|'danger'|'neutral' })`

- [ ] **Step 1: `Card.tsx`**

```tsx
import type { ReactNode } from 'react';

interface CardProps { title?: string; children: ReactNode; className?: string; actions?: ReactNode; }

export function Card({ title, children, className = '', actions }: CardProps) {
  return (
    <section className={`rounded-card bg-white shadow-card border border-neutral-100 ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
          {title && <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: `NumberInput.tsx`**

```tsx
interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
}

export function NumberInput({ label, value, onChange, suffix, step = 1, min = 0 }: NumberInputProps) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-500 mb-1">{label}</span>
      <div className="flex items-center rounded-lg border border-neutral-200 focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600 bg-white">
        <input
          type="number"
          className="w-full px-3 py-2 text-sm text-neutral-800 bg-transparent outline-none rounded-lg"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="px-3 text-xs text-neutral-400 whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}
```

- [ ] **Step 3: `Select.tsx`**

```tsx
interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-500 mb-1">{label}</span>
      <select
        className="w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
```

- [ ] **Step 4: `Checkbox.tsx`**

```tsx
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 accent-primary-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm text-neutral-700">{label}</span>
        {description && <span className="block text-xs text-neutral-400">{description}</span>}
      </span>
    </label>
  );
}
```

- [ ] **Step 5: `SegmentedControl.tsx`**

```tsx
interface SegmentedControlProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SegmentedControl({ value, options, onChange }: SegmentedControlProps) {
  return (
    <div className="inline-flex w-full rounded-lg bg-neutral-100 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: `Badge.tsx`**

```tsx
import type { ReactNode } from 'react';

type Tone = 'primary' | 'success' | 'danger' | 'neutral';
const TONE: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-500/10 text-success-600',
  danger: 'bg-danger-500/10 text-danger-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]}`}>{children}</span>;
}
```

- [ ] **Step 7: 컴파일 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (미사용 import 경고만 가능)

```bash
git add -A
git commit -m "feat: UI 프리미티브 컴포넌트(Card/NumberInput/Select/Checkbox/SegmentedControl/Badge)"
```

---

### Task 11: 입력 패널 컴포넌트 (주거형태별 동적 + 공통 + 정책 + 투자)

**Files:**
- Create: `src/components/inputs/CommonInputs.tsx`
- Create: `src/components/inputs/HousingInputs.tsx`
- Create: `src/components/inputs/PolicyFilters.tsx`
- Create: `src/components/inputs/InvestInputs.tsx`
- Create: `src/components/inputs/ScenarioPanel.tsx`

**Interfaces:**
- Consumes: `useScenarioStore`, config(`HOUSING_LABELS`, `DISTRICTS`, `getDistrict`), ui 프리미티브.
- Produces: `ScenarioPanel({ id })` — 한 시나리오의 전체 입력 패널.
- 각 입력 컴포넌트는 `id: 'A'|'B'` prop을 받아 store 액션 호출. 금액은 "만원" 단위로 입력받아 원으로 환산(`× 10000`)하여 store에 저장. 비율은 % 입력받아 소수로 환산(`/ 100`).

- [ ] **Step 1: `CommonInputs.tsx`**

```tsx
import { useScenarioStore } from '../../store/scenarioStore';
import { NumberInput } from '../ui/NumberInput';

const W = 10_000; // 만원 → 원

export function CommonInputs({ id }: { id: 'A' | 'B' }) {
  const common = useScenarioStore((s) => s.scenarios[id].common);
  const update = useScenarioStore((s) => s.updateCommon);
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInput label="보유 현금 (만원)" value={common.cash / W} step={100} onChange={(v) => update(id, { cash: v * W })} />
      <NumberInput label="부부합산 연소득 (만원)" value={common.annualIncome / W} step={100} onChange={(v) => update(id, { annualIncome: v * W })} />
      <NumberInput label="월 생활비 (만원)" value={common.monthlyLiving / W} step={10} onChange={(v) => update(id, { monthlyLiving: v * W })} />
      <NumberInput label="기존 신용대출 (만원)" value={common.creditLoan / W} step={100} onChange={(v) => update(id, { creditLoan: v * W })} />
    </div>
  );
}
```

- [ ] **Step 2: `HousingInputs.tsx` (주거형태별 동적 입력)**

```tsx
import { useScenarioStore } from '../../store/scenarioStore';
import { NumberInput } from '../ui/NumberInput';
import { SegmentedControl } from '../ui/SegmentedControl';
import { HOUSING_LABELS } from '../../config/defaults.config';
import type { HousingType } from '../../types/domain';

const W = 10_000;
const P = 100; // % → 소수

const HOUSING_OPTIONS = (Object.keys(HOUSING_LABELS) as HousingType[]).map((t) => ({ value: t, label: HOUSING_LABELS[t] }));

export function HousingInputs({ id }: { id: 'A' | 'B' }) {
  const housing = useScenarioStore((s) => s.scenarios[id].housing);
  const setType = useScenarioStore((s) => s.setHousingType);
  const update = useScenarioStore((s) => s.updateHousing);

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={housing.type}
        options={HOUSING_OPTIONS}
        onChange={(v) => setType(id, v as HousingType)}
      />

      {housing.type === 'happy' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="보증금 (만원)" value={housing.deposit / W} step={100} onChange={(v) => update(id, { deposit: v * W })} />
          <NumberInput label="월세 (만원)" value={housing.monthlyRent / W} step={1} onChange={(v) => update(id, { monthlyRent: v * W })} />
          <NumberInput label="관리비 (만원)" value={housing.managementFee / W} step={1} onChange={(v) => update(id, { managementFee: v * W })} />
          <NumberInput label="보증금 증감 비율 (%)" value={housing.depositAdjustRate * P} step={0.5} onChange={(v) => update(id, { depositAdjustRate: v / P })} />
          <NumberInput label="보증금 전환 이율 (%)" value={housing.interestRate * P} step={0.1} onChange={(v) => update(id, { interestRate: v / P })} />
        </div>
      )}

      {housing.type === 'jeonse' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="전세 보증금 (만원)" value={housing.deposit / W} step={100} onChange={(v) => update(id, { deposit: v * W })} />
          <NumberInput label="전세자금대출 한도 (만원)" value={housing.loanLimit / W} step={100} onChange={(v) => update(id, { loanLimit: v * W })} />
          <NumberInput label="전세대출 금리 (%)" value={housing.loanRate * P} step={0.1} onChange={(v) => update(id, { loanRate: v / P })} />
          <NumberInput label="관리비 (만원)" value={housing.managementFee / W} step={1} onChange={(v) => update(id, { managementFee: v * W })} />
        </div>
      )}

      {housing.type === 'purchase' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="주택 가격 (만원)" value={housing.price / W} step={100} onChange={(v) => update(id, { price: v * W })} />
          <NumberInput label="주담대 금리 (%)" value={housing.loanRate * P} step={0.1} onChange={(v) => update(id, { loanRate: v / P })} />
          <NumberInput label="대출 만기 (년)" value={housing.loanMaturityYears} step={1} onChange={(v) => update(id, { loanMaturityYears: v })} />
          <NumberInput label="관리비 (만원)" value={housing.managementFee / W} step={1} onChange={(v) => update(id, { managementFee: v * W })} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `PolicyFilters.tsx` (정책 + 자치구 규제 표시)**

```tsx
import { useScenarioStore } from '../../store/scenarioStore';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { DISTRICTS, getDistrict } from '../../config/districts.config';
import { POLICY } from '../../config/policy.config';
import { formatPercent } from '../../lib/format';

export function PolicyFilters({ id }: { id: 'A' | 'B' }) {
  const policy = useScenarioStore((s) => s.scenarios[id].policy);
  const housingType = useScenarioStore((s) => s.scenarios[id].housing.type);
  const update = useScenarioStore((s) => s.updatePolicy);
  const district = getDistrict(policy.districtCode);

  const districtOptions = DISTRICTS.map((d) => ({ value: d.code, label: d.name }));
  const stressAdd = formatPercent(POLICY.stressRateAdd);

  return (
    <div className="space-y-4">
      <Select label="자치구" value={policy.districtCode} options={districtOptions} onChange={(v) => update(id, { districtCode: v })} />
      <div className="flex flex-wrap gap-2">
        <Badge tone={district.regulated ? 'danger' : 'success'}>{district.regulated ? '규제지역' : '비규제지역'}</Badge>
        {district.landTransactionPermit && <Badge tone="danger">토지거래허가구역</Badge>}
      </div>
      {housingType === 'purchase' && (
        <div className="space-y-3 pt-1">
          <Checkbox
            label="생애최초 주택구매"
            description="체크 시 비규제 LTV 80% 적용(규제지역은 한도 별도)"
            checked={policy.isFirstHome}
            onChange={(c) => update(id, { isFirstHome: c })}
          />
          <Checkbox
            label="스트레스 DSR 적용"
            description={`심사 금리 +${stressAdd} 가산하여 대출 한도 축소`}
            checked={policy.stressDsr}
            onChange={(c) => update(id, { stressDsr: c })}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: `InvestInputs.tsx`**

```tsx
import { useScenarioStore } from '../../store/scenarioStore';
import { NumberInput } from '../ui/NumberInput';

const P = 100;

export function InvestInputs({ id }: { id: 'A' | 'B' }) {
  const invest = useScenarioStore((s) => s.scenarios[id].invest);
  const update = useScenarioStore((s) => s.updateInvest);
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInput label="ETF 연수익률 (%)" value={invest.etfReturnRate * P} step={0.5} onChange={(v) => update(id, { etfReturnRate: v / P })} />
      <NumberInput label="부동산 연상승률 (%)" value={invest.realEstateGrowthRate * P} step={0.5} onChange={(v) => update(id, { realEstateGrowthRate: v / P })} />
    </div>
  );
}
```

- [ ] **Step 5: `ScenarioPanel.tsx` (조합)**

```tsx
import { Card } from '../ui/Card';
import { CommonInputs } from './CommonInputs';
import { HousingInputs } from './HousingInputs';
import { PolicyFilters } from './PolicyFilters';
import { InvestInputs } from './InvestInputs';

export function ScenarioPanel({ id }: { id: 'A' | 'B' }) {
  return (
    <div className="space-y-4">
      <Card title="주거 형태"><HousingInputs id={id} /></Card>
      <Card title="공통 입력"><CommonInputs id={id} /></Card>
      <Card title="정책 / 규제"><PolicyFilters id={id} /></Card>
      <Card title="투자 엔진"><InvestInputs id={id} /></Card>
    </div>
  );
}
```

- [ ] **Step 6: 컴파일 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음

```bash
git add -A
git commit -m "feat: 입력 패널(주거형태 동적/공통/정책/투자) 컴포넌트"
```

---

### Task 12: 대시보드 컴포넌트 (요약 + 순자산 차트 + 현금흐름 + 상환 진행도)

**Files:**
- Create: `src/components/dashboard/SummaryCards.tsx`
- Create: `src/components/dashboard/NetWorthChart.tsx`
- Create: `src/components/dashboard/CashflowTable.tsx`
- Create: `src/components/dashboard/LoanProgressChart.tsx`
- Create: `src/components/dashboard/Dashboard.tsx`

**Interfaces:**
- Consumes: `SimulationResult`, `formatKRW`/`formatPercent`, Recharts, `Card`/`Badge`.
- Produces: `Dashboard({ result, accent })` — `accent`는 차트 색상(`#2563eb` 등 토큰 hex). 각 하위 컴포넌트는 `result: SimulationResult`를 prop으로 받음(순수 표시).

- [ ] **Step 1: `SummaryCards.tsx`**

```tsx
import type { SimulationResult } from '../../types/result';
import { formatKRW, formatPercent } from '../../lib/format';
import { Card } from '../ui/Card';

export function SummaryCards({ result }: { result: SimulationResult }) {
  const last = result.projection[result.projection.length - 1];
  const items = [
    { label: '확정 대출액', value: formatKRW(result.loan.finalLoan), sub: result.loan.finalLoan > 0 ? `LTV ${formatPercent(result.loan.appliedLtvRatio)}` : '대출 없음' },
    { label: '초기 필요 현금', value: formatKRW(result.tax.initialCashNeeded || 0), sub: result.tax.acquisitionCost > 0 ? `부대비용 ${formatKRW(result.tax.acquisitionCost)}` : '—' },
    { label: '월 순저축', value: formatKRW(result.cashflow.monthlySaving), sub: `고정지출 ${formatKRW(result.cashflow.monthlyFixedCost)}` },
    { label: `${last.year}년 후 순자산`, value: formatKRW(last.netWorth), sub: `부동산 ${formatKRW(last.realEstateValue)}` },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <Card key={it.label} className="!p-0">
          <div className="p-4">
            <p className="text-xs text-neutral-400">{it.label}</p>
            <p className="mt-1 text-lg font-bold text-neutral-800">{it.value}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{it.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `NetWorthChart.tsx`**

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SimulationResult } from '../../types/result';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';

export function NetWorthChart({ result, accent }: { result: SimulationResult; accent: string }) {
  const data = result.projection.map((p) => ({ year: `${p.year}년`, 순자산: Math.round(p.netWorth) }));
  return (
    <Card title="순자산 시뮬레이션">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
            <Tooltip formatter={(v: number) => formatKRW(v)} />
            <Line type="monotone" dataKey="순자산" stroke={accent} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: `LoanProgressChart.tsx` (대출 원금 상환 진행도)**

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SimulationResult } from '../../types/result';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';

export function LoanProgressChart({ result, accent }: { result: SimulationResult; accent: string }) {
  const total = result.loan.finalLoan;
  if (total <= 0) {
    return <Card title="대출 원금 상환 진행도"><p className="text-sm text-neutral-400 py-8 text-center">대출이 없는 시나리오입니다.</p></Card>;
  }
  const data = result.projection.map((p) => ({
    year: `${p.year}년`,
    상환원금: Math.round(total - p.remainingLoan),
    잔여원금: Math.round(p.remainingLoan),
  }));
  return (
    <Card title="대출 원금 상환 진행도">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
            <Tooltip formatter={(v: number) => formatKRW(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="상환원금" stackId="a" fill={accent} radius={[0, 0, 0, 0]} />
            <Bar dataKey="잔여원금" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: `CashflowTable.tsx`**

```tsx
import type { SimulationResult } from '../../types/result';
import { formatKRW } from '../../lib/format';
import { Card } from '../ui/Card';

export function CashflowTable({ result }: { result: SimulationResult }) {
  const { cashflow } = result;
  const rows = [
    { label: '월 소득 (연소득/12)', value: cashflow.monthlyIncome, tone: 'text-neutral-800' },
    { label: '− 대출 원리금', value: -cashflow.breakdown.principalInterest, tone: 'text-danger-600' },
    { label: '− 월세', value: -cashflow.breakdown.rent, tone: 'text-danger-600' },
    { label: '− 관리비', value: -cashflow.breakdown.managementFee, tone: 'text-danger-600' },
  ];
  return (
    <Card title="월 현금 흐름표">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-neutral-50 last:border-0">
              <td className="py-2 text-neutral-500">{r.label}</td>
              <td className={`py-2 text-right font-medium ${r.tone}`}>{formatKRW(r.value)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-neutral-100">
            <td className="py-2.5 font-semibold text-neutral-700">월 순저축</td>
            <td className={`py-2.5 text-right font-bold ${cashflow.monthlySaving >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatKRW(cashflow.monthlySaving)}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
```

- [ ] **Step 5: `Dashboard.tsx` (조합)**

```tsx
import type { SimulationResult } from '../../types/result';
import { SummaryCards } from './SummaryCards';
import { NetWorthChart } from './NetWorthChart';
import { LoanProgressChart } from './LoanProgressChart';
import { CashflowTable } from './CashflowTable';

export function Dashboard({ result, accent }: { result: SimulationResult; accent: string }) {
  return (
    <div className="space-y-4">
      <SummaryCards result={result} />
      <NetWorthChart result={result} accent={accent} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LoanProgressChart result={result} accent={accent} />
        <CashflowTable result={result} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 컴파일 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음

```bash
git add -A
git commit -m "feat: 대시보드(요약/순자산차트/상환진행도/현금흐름표) 컴포넌트"
```

---

### Task 13: 비교 모드 + 색상 토큰 상수

**Files:**
- Create: `src/config/theme.config.ts`
- Create: `src/components/comparison/ComparisonView.tsx`

**Interfaces:**
- Consumes: `simulate`, `useScenarioStore`, `Dashboard`, `formatKRW`.
- Produces:
  - `CHART_COLORS = { A: string; B: string }` — JS에서 Recharts에 넘길 hex(토큰과 동일 값, 한 곳에서만 정의).
  - `ComparisonView()` — A·B 시뮬레이션 결과를 나란히 + 핵심 지표 델타.

- [ ] **Step 1: `src/config/theme.config.ts` (차트용 색상 단일 출처)**

```ts
// Recharts는 CSS 클래스를 못 받으므로 hex가 필요. 토큰과 동일 값을 한 곳에서만 정의.
export const CHART_COLORS = {
  A: '#2563eb', // primary-600
  B: '#16a34a', // success-500
} as const;
```

- [ ] **Step 2: `ComparisonView.tsx`**

```tsx
import { useMemo } from 'react';
import { useScenarioStore } from '../../store/scenarioStore';
import { simulate } from '../../lib/simulate';
import { Dashboard } from '../dashboard/Dashboard';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CHART_COLORS } from '../../config/theme.config';
import { formatKRW } from '../../lib/format';
import { HOUSING_LABELS } from '../../config/defaults.config';

export function ComparisonView() {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const resultA = useMemo(() => simulate(scenarios.A), [scenarios.A]);
  const resultB = useMemo(() => simulate(scenarios.B), [scenarios.B]);

  const lastA = resultA.projection[resultA.projection.length - 1];
  const lastB = resultB.projection[resultB.projection.length - 1];
  const delta = lastA.netWorth - lastB.netWorth;
  const winner = delta >= 0 ? 'A' : 'B';

  return (
    <div className="space-y-4">
      <Card title="비교 요약">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge tone="primary">A · {HOUSING_LABELS[scenarios.A.housing.type]}</Badge>
            <span className="text-neutral-400">vs</span>
            <Badge tone="success">B · {HOUSING_LABELS[scenarios.B.housing.type]}</Badge>
          </div>
          <p className="text-sm text-neutral-600">
            {lastA.year}년 후 순자산 차이:{' '}
            <span className={`font-bold ${delta >= 0 ? 'text-primary-600' : 'text-success-600'}`}>
              시나리오 {winner}가 {formatKRW(Math.abs(delta))} 우위
            </span>
          </p>
        </div>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary-700">시나리오 A</h3>
          <Dashboard result={resultA} accent={CHART_COLORS.A} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-success-600">시나리오 B</h3>
          <Dashboard result={resultB} accent={CHART_COLORS.B} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 컴파일 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음

```bash
git add -A
git commit -m "feat: 비교 모드 뷰 + 차트 색상 토큰 단일 출처"
```

---

### Task 14: App 레이아웃 조립 + 헤더 + 단일/비교 토글

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/SingleView.tsx`

**Interfaces:**
- Consumes: `useScenarioStore`, `ScenarioPanel`, `Dashboard`, `ComparisonView`, `simulate`, `CHART_COLORS`.
- Produces: 완성된 앱 — 단일 모드(A 패널+대시보드) ↔ 비교 모드 토글.

- [ ] **Step 1: `Header.tsx`**

```tsx
import { useScenarioStore } from '../../store/scenarioStore';

export function Header() {
  const comparisonMode = useScenarioStore((s) => s.comparisonMode);
  const toggle = useScenarioStore((s) => s.toggleComparison);
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">집</div>
          <div>
            <h1 className="text-base font-bold text-neutral-800">내 집 마련 시뮬레이터</h1>
            <p className="text-xs text-neutral-400">주거 형태 비교 · 자산 증식 시뮬레이션</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            comparisonMode ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {comparisonMode ? '비교 모드 ON' : '비교 모드'}
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: `SingleView.tsx`**

```tsx
import { useMemo } from 'react';
import { useScenarioStore } from '../../store/scenarioStore';
import { simulate } from '../../lib/simulate';
import { ScenarioPanel } from '../inputs/ScenarioPanel';
import { Dashboard } from '../dashboard/Dashboard';
import { CHART_COLORS } from '../../config/theme.config';

export function SingleView() {
  const scenarioA = useScenarioStore((s) => s.scenarios.A);
  const result = useMemo(() => simulate(scenarioA), [scenarioA]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      <aside><ScenarioPanel id="A" /></aside>
      <main><Dashboard result={result} accent={CHART_COLORS.A} /></main>
    </div>
  );
}
```

- [ ] **Step 3: `App.tsx` 조립**

```tsx
import { useScenarioStore } from './store/scenarioStore';
import { Header } from './components/layout/Header';
import { SingleView } from './components/layout/SingleView';
import { ComparisonView } from './components/comparison/ComparisonView';

export default function App() {
  const comparisonMode = useScenarioStore((s) => s.comparisonMode);
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {comparisonMode ? <ComparisonView /> : <SingleView />}
      </div>
      {comparisonMode && (
        <ComparisonInputs />
      )}
    </div>
  );
}

import { ScenarioPanel } from './components/inputs/ScenarioPanel';
import { Card } from './components/ui/Card';

function ComparisonInputs() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
      <Card title="시나리오 입력 (A / B)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div><h4 className="text-sm font-semibold text-primary-700 mb-3">시나리오 A</h4><ScenarioPanel id="A" /></div>
          <div><h4 className="text-sm font-semibold text-success-600 mb-3">시나리오 B</h4><ScenarioPanel id="B" /></div>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: dev 서버로 수동 확인**

Run: `npm run dev`
확인 항목:
- 주거 형태 변경 시 입력 필드가 동적으로 바뀐다
- 입력값 변경 시 차트/숫자가 즉시 갱신된다(reactivity)
- 비교 모드 토글 시 A/B 나란히 표시 + 델타 표시
- primary 색상이 #2563eb로 일관 적용

- [ ] **Step 5: 빌드 + 전체 테스트 + 커밋**

Run: `npm run build && npm test`
Expected: 빌드 성공, 전체 테스트 PASS

```bash
git add -A
git commit -m "feat: App 레이아웃 조립(헤더/단일뷰/비교뷰 토글)"
```

---

### Task 15: README + GitHub 원격 푸시

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: 프로젝트 소개/실행법 문서, GitHub 원격 연결 + 푸시.

- [ ] **Step 1: `README.md` 작성**

```markdown
# 내 집 마련 & 자산 증식 통합 시뮬레이터

2030 세대를 위한 주거 형태(행복주택·전세·매매) 비교 + 자산 증식 시뮬레이터.

## 기능
- 주거 형태별 동적 입력 (행복주택 / 전세 / 일반 매매)
- 대출 한도 = min(LTV, DSR 40%) 확정 로직, 스트레스 DSR·생애최초·신용대출 반영
- 취득세/부대비용 자동 계산, 초기 필요 현금 산출
- 연복리 기반 5·10년 순자산 시뮬레이션 (부동산 + 금융자산 − 잔여 대출)
- 월 현금흐름표, 대출 상환 진행도, 시나리오 A/B 비교 모드

## 기술 스택
React + TypeScript (Vite), Tailwind CSS, Zustand, Recharts, Vitest.

## 실행
```bash
npm install
npm run dev      # 개발 서버
npm test         # 계산 엔진 단위 테스트
npm run build    # 프로덕션 빌드
```

## 구조
- `src/config/` — 정책 수치(LTV/DSR/취득세 등) 전부 분리, 하드코딩 0
- `src/lib/` — 순수 계산 엔진(UI 의존성 0) + 단위 테스트
- `src/store/` — Zustand 시나리오 상태
- `src/components/` — inputs / dashboard / comparison / ui / layout

> 정책 수치는 추정치이며 `src/config/policy.config.ts`에서 조정 가능합니다. 실제 대출/세금은 금융기관·세무 기준을 확인하세요.
```

- [ ] **Step 2: 원격 연결 + 푸시**

```bash
cd "C:/Project/home-planner"
git add -A
git commit -m "docs: README 추가"
git branch -M main
git remote add origin https://github.com/plumpsqrl9744/home-planner.git
git push -u origin main
```

Expected: main 브랜치 푸시 성공.
(원격에 기존 커밋이 있어 거부되면 `git pull --rebase origin main` 후 재푸시, 또는 사용자 확인.)

- [ ] **Step 3: 최종 확인**

GitHub 레포에 코드가 올라갔는지 확인. 끝.

---

## Self-Review

**Spec coverage:**
- 주거 형태 동적 선택 → Task 11 (HousingInputs)
- 공통/상세 입력 → Task 11
- 투자 엔진 → Task 11 (InvestInputs)
- 생애최초 LTV/규제 → Task 4 (resolveLtvRatio) + Task 11 (PolicyFilters)
- 스트레스 DSR 가산 → Task 4 (calcPurchaseLoan)
- 자치구 규제 표시 → Task 3 (districts) + Task 11 (PolicyFilters)
- min(LTV, DSR) → Task 4 ✓
- 연복리 → Task 7 ✓
- 신용대출 DSR 100% → Task 4 ✓
- 취득세/부대비용 3% → Task 5 ✓
- 순자산 5/10년 그래프 → Task 12 (NetWorthChart)
- 현금흐름표 → Task 12 (CashflowTable)
- 대출 상환 진행도 막대 → Task 12 (LoanProgressChart)
- 비교 모드 → Task 13 (ComparisonView)
- 실시간 reactivity → Task 14 (useMemo + store)
- 컴포넌트 분리 → 전체 구조
- 색상 변수화/토큰 → Task 1 (tailwind.config) + Task 13 (CHART_COLORS)

**Placeholder scan:** 없음. 모든 step에 실제 코드/명령 포함.

**Type consistency:** `simulate`, `LoanResult`, `SimulationResult`, `CHART_COLORS`, store 액션명(`updateCommon` 등)이 정의처와 소비처에서 일치.
