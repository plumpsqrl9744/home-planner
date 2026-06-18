# 내 집 마련 & 자산 증식 통합 시뮬레이터 — 설계 문서

작성일: 2026-06-18
대상: 2030 세대를 위한 주거 형태 비교 + 자산 증식 시뮬레이터 웹 애플리케이션

## 1. 목적과 범위

2030 세대가 **행복주택(임대) / 전세 / 일반 매매** 중 주거 형태를 선택·비교하고,
거주 후 남은 현금과 절감되는 주거비를 어떻게 굴릴지(ETF·부동산)에 따라
5년/10년 후 순자산을 시뮬레이션하는 단일 페이지 웹 앱(SPA).

핵심 가치: **실시간 reactivity** — 사용자가 변수를 바꿀 때마다 즉시 결과 반영.
**시나리오 A/B 비교 모드** — 두 선택지를 나란히 두고 숫자로 비교.

### 범위 (기획서 전체를 한 번에 구현)
- 3가지 주거 형태별 동적 입력 폼
- 정책 필터(생애최초, 스트레스 DSR, 자치구 규제)
- 대시보드(순자산 차트, 현금흐름표, 대출 상환 진행도)
- 시나리오 A/B 비교 모드

### 명시적 비범위 (YAGNI)
- 백엔드/서버, 사용자 인증, 데이터 영속화(추후 localStorage 가능성만 열어둠)
- 실시간 정책 API 연동 (정책 수치는 config로 고정, 추후 수정)

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 빌드/프레임워크 | Vite + React + TypeScript | 정적 클라이언트 계산기에 최적. 복잡한 금융 로직을 타입으로 안전하게 관리 |
| 스타일 | Tailwind CSS | 디자인 토큰을 config로 중앙 관리, 색상 코드 반복 제거 |
| 상태 관리 | Zustand | 시나리오 A/B 입력값 전역 관리 + selector로 파생 결과 계산 |
| 차트 | Recharts | 순자산 라인차트, 대출 상환 진행도 막대그래프 |
| 테스트 | Vitest | 계산 엔진(lib/) 단위 테스트 |

## 3. 아키텍처 핵심 원칙

**계산 로직과 UI의 완전한 분리.**
모든 금융 계산은 순수 함수(`lib/`)로 구현하고 UI 의존성을 0으로 둔다.
UI는 계산 결과를 표시만 한다. 모든 정책 수치/기본값은 `config/`로 분리하여
코드 내 하드코딩을 0으로 만든다.

```
src/
├─ config/                  # 모든 정책 수치 (하드코딩 0)
│  ├─ policy.config.ts      # LTV/DSR 한도, 취득세율, 스트레스 가산금리, 부대비용율
│  ├─ districts.config.ts   # 자치구별 규제(토지거래허가구역, 규제지역 등)
│  └─ defaults.config.ts    # 입력 기본값, ETF 기본수익률, 부동산 상승률
├─ lib/                     # 순수 계산 엔진 (UI 의존성 0)
│  ├─ loan.ts               # 원리금균등상환, LTV한도, DSR한도, min() 확정 로직
│  ├─ tax.ts                # 취득세 + 부대비용
│  ├─ projection.ts         # 연복리 자산 시뮬레이션, 순자산 추이
│  ├─ cashflow.ts           # 월 고정지출 vs 순저축 계산
│  └─ simulate.ts           # 위 함수들을 조합해 시나리오 1개의 전체 결과 산출
├─ store/
│  └─ scenarioStore.ts      # 시나리오 A/B 입력값 + 파생 결과(selector)
├─ types/                   # 도메인 타입
├─ components/
│  ├─ inputs/               # 주거형태별 동적 입력 + 공통 입력 + 정책 필터
│  ├─ dashboard/            # 순자산 차트, 현금흐름표, 대출 상환 진행도
│  ├─ comparison/           # 시나리오 A/B 비교 뷰
│  └─ ui/                   # 재사용 프리미티브(Button, Card, NumberInput, ...)
├─ theme/ (tailwind.config) # 디자인 토큰(primary #2563eb 등)
└─ App.tsx
```

## 4. 도메인 모델 (types)

```ts
type HousingType = 'happy' | 'jeonse' | 'purchase';  // 행복주택 / 전세 / 매매

// 공통 입력
interface CommonInput {
  cash: number;            // 보유 현금
  annualIncome: number;    // 부부합산 연소득
  monthlyLiving: number;   // 월 생활비
  creditLoan: number;      // 기존 신용대출 잔액 (DSR 반영)
}

// 주거 형태별 입력 (discriminated union)
type HousingInput =
  | { type: 'happy';    deposit; monthlyRent; depositAdjustRate; interestRate }
  | { type: 'jeonse';   deposit; loanLimit; loanRate }
  | { type: 'purchase'; price; ltvManual?; loanMaturityYears; isFirstHome; districtCode };

// 정책 필터
interface PolicyFlags {
  isFirstHome: boolean;    // 생애최초
  stressDsr: boolean;      // 스트레스 DSR
  districtCode: string;    // 자치구
}

// 투자 엔진
interface InvestInput {
  etfReturnRate: number;        // ETF 연수익률
  realEstateGrowthRate: number; // 부동산 연상승률
}

interface Scenario {
  common: CommonInput;
  housing: HousingInput;
  policy: PolicyFlags;
  invest: InvestInput;
}
```

## 5. 계산 엔진 로직 (가장 중요)

### 5.1 원리금균등상환 월 납입금 (loan.ts)
```
M = P · r · (1+r)^n / ((1+r)^n − 1)
  P = 원금, r = 월금리(연금리/12), n = 총 개월수(만기년 × 12)
```

### 5.2 대출 한도 확정 — 반드시 min() 로직
- **LTV 한도** = 주택가격 × 적용 LTV비율
  - 생애최초 체크 시: 비규제 80%, 규제지역은 자치구 config 한도 적용
  - 미체크 시: 자치구 규제 기본 한도(예: 비규제 70%)
- **DSR 한도** = 연소득 × DSR상한(40%)을 "연간 총 원리금 상환액"으로 삼아
  역산한 최대 대출 원금.
  - 심사금리: 스트레스 DSR 체크 시 `실제금리 + 가산(config, 기본 1.5%p)`, 아니면 실제금리.
  - 기존 **신용대출이 있으면 원금 100%를 DSR 분자에 반영**(보수적).
  - 역산: 가용 연간 원리금 = 연소득 × 0.4 − 신용대출 연원리금 → 이를 만족하는 최대 P.
- **확정 대출액** = `min(LTV 한도, DSR 한도)`
- 실제 월 납입금은 확정 대출액과 **실제 금리**로 계산(스트레스 금리는 한도 산정에만 사용).

### 5.3 취득세 + 부대비용 (tax.ts)
- 매매 시 부대비용 = 주택가격 × 부대비용율(config, 기본 3%) — 취득세·중개수수료 포함.
- 초기 필요 현금 = 주택가격 − 확정 대출액 + 부대비용.

### 5.4 자산 시뮬레이션 — 연복리 (projection.ts)
- 부동산 평가액(t년) = 주택가격 × (1 + 부동산상승률)^t
- 금융자산(t년): 거주 후 잔여현금 + 매월 순저축액을 ETF 수익률로 연복리 적립
  - 잔여현금 = 보유현금 − 초기 필요 현금(매매) / − 보증금(전세·행복)
  - 월 순저축 = 월소득 − 월 고정지출 − 월 생활비 (cashflow에서 산출)
  - 적립: 연 단위 복리 + 월 적립분 합산(연말 합산 모델, 문서에 가정 명시)
- 잔여 대출원금(t년): 원리금균등 상환 스케줄에서 t년 시점 잔액
- **순자산(t년) = 부동산 평가액 + 금융자산 − 잔여 대출원금**

### 5.5 현금 흐름표 (cashflow.ts)
- 월 고정지출 = 대출 원리금 + 월세 + 관리비(해당 시)
- 월 순저축 = (연소득/12) − 월 고정지출 − 월 생활비

### 5.6 조합 (simulate.ts)
시나리오 1개 → `{ loanResult, taxResult, cashflow, projection[] }` 산출.
store의 selector가 A/B 각각에 대해 호출, 입력 변경 시 자동 재계산.

## 6. 정책 데이터 (config) — 하드코딩 0

`policy.config.ts` 예시 구조:
```ts
export const POLICY = {
  dsrLimit: 0.4,
  stressRateAdd: 0.015,        // 스트레스 가산 1.5%p
  acquisitionCostRate: 0.03,   // 부대비용 3%
  ltv: {
    firstHome: { nonRegulated: 0.8, regulated: 0.6 },
    general:   { nonRegulated: 0.7, regulated: 0.5 },
  },
} as const;
```
`districts.config.ts`: 서울 자치구 등 코드별 `{ name, regulated, landTransactionPermit }`.
값은 2025년 기준 합리적 추정치로 세팅하고, 추후 사용자가 수치만 수정.

## 7. 출력 (대시보드)

- **순자산 시뮬레이션**: Recharts 라인차트, x축 연차(0~10), 시나리오 색상 구분.
- **현금 흐름표**: 카드/테이블 — 월 고정지출 항목 분해 + 순저축.
- **대출 원금 상환 진행도**: 막대그래프(상환 누적 / 잔여).
- **비교 모드**: A vs B 나란히, 핵심 지표 델타(순자산 차이, 초기현금, 월 부담) 강조.

## 8. 상태 관리 (Zustand)

`scenarioStore`:
- state: `scenarios: { A: Scenario; B: Scenario }`, `activeTab`, `comparisonMode`
- actions: `updateScenario(id, patch)`, `setHousingType(id, type)`, `togglePolicy(...)`
- 파생 결과는 컴포넌트에서 `useMemo(() => simulate(scenario), [scenario])` 또는
  store selector로 계산 — 입력 변경 시 자동 재계산(reactivity).

## 9. 디자인 시스템

- Tailwind config에 디자인 토큰 정의:
  - `primary` = #2563eb, 스케일 50~900
  - 시맨틱: success / danger / neutral
- 색상 코드 직접 작성 금지 — 전부 토큰 클래스(`bg-primary-600` 등) 사용.
- 핀테크 신뢰감 톤: 넉넉한 여백, 카드 기반 레이아웃, 명확한 타이포 위계.
- 반응형: 데스크탑 우선, 모바일에서 입력/대시보드 세로 스택.

## 10. 검증 (테스트)

Vitest로 `lib/` 순수 함수 단위 테스트:
- 원리금균등 월납입금: 알려진 값 검증
- DSR 역산 한도 + 스트레스 금리 가산
- `min(LTV, DSR)` 확정 로직
- 연복리 자산 성장
- 취득세/부대비용 3%

## 11. 배포

- GitHub: https://github.com/plumpsqrl9744/home-planner 에 푸시.
- 추후 Vercel/GitHub Pages 정적 배포 가능(범위 외, 구조만 호환).
