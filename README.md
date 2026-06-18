# 내 집 마련 & 자산 증식 통합 시뮬레이터

2030 세대를 위한 주거 형태(행복주택·전세·매매) 비교 + 자산 증식 시뮬레이터.
주거 형태를 선택하고 거주 후 남은 현금과 절감되는 주거비를 굴렸을 때
5·10년 뒤 순자산이 어떻게 달라지는지 실시간으로 비교합니다.

## 기능

- **주거 형태별 동적 입력** — 행복주택(임대) / 전세 / 일반 매매 선택 시 입력 필드가 동적으로 변경
- **대출 한도 로직** — `min(LTV 한도, DSR 40% 한도)` 확정. 생애최초·스트레스 DSR·신용대출 반영
- **취득세/부대비용 자동 계산** — 집값의 3%를 초기 필요 현금에 자동 반영
- **연복리 자산 시뮬레이션** — 부동산 평가액 + 금융자산(ETF) − 잔여 대출원금 = 순자산
- **대시보드** — 순자산 추이 라인차트, 월 현금흐름표, 대출 원금 상환 진행도 막대그래프
- **시나리오 A/B 비교 모드** — 두 선택지를 나란히 두고 순자산 차이를 숫자로 비교
- **실시간 반영** — 입력값을 바꾸면 모든 결과가 즉시 재계산

## 기술 스택

React 18 + TypeScript (Vite) · Tailwind CSS · Zustand · Recharts · Vitest

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm test         # 계산 엔진 + 통합 단위 테스트
npm run build    # 프로덕션 빌드
```

## 구조

```
src/
├─ config/       정책 수치(LTV/DSR/취득세/자치구 규제) 전부 분리 — 하드코딩 0
├─ lib/          순수 계산 엔진(UI 의존성 0) + 단위 테스트
│  ├─ loan       원리금균등상환 · LTV/DSR 한도 · min 확정
│  ├─ tax        취득세/부대비용 · 초기 필요 현금
│  ├─ cashflow   월 고정지출 · 순저축
│  ├─ projection 연복리 자산 성장 · 잔여 원금 · 순자산 추이
│  └─ simulate   시나리오 1개의 전체 결과 조합
├─ store/        Zustand 시나리오(A/B) 상태
├─ components/
│  ├─ ui/         재사용 프리미티브 (Card, NumberInput, Select ...)
│  ├─ inputs/     주거형태 동적 입력 · 공통 · 정책 · 투자
│  ├─ dashboard/  요약 카드 · 차트 · 현금흐름표
│  ├─ comparison/ 시나리오 A/B 비교 뷰
│  └─ layout/     헤더 · 단일/비교 레이아웃
└─ theme(tailwind.config) 디자인 토큰 (primary #2563eb 등)
```

## 디자인

- Primary 색상 `#2563eb`. 모든 색상은 `tailwind.config.js`의 디자인 토큰으로 관리하며
  컴포넌트에 색상 코드를 직접 작성하지 않습니다.
- 차트(Recharts)는 CSS 클래스를 받지 못해 hex가 필요하므로,
  동일 값을 `src/config/theme.config.ts` 한 곳에서만 정의합니다.

## 참고

정책 수치(LTV/DSR 한도, 취득세율, 스트레스 가산금리, 자치구 규제 등)는 추정치이며
`src/config/policy.config.ts`, `src/config/districts.config.ts`에서 조정할 수 있습니다.
실제 대출·세금은 금융기관 및 세무 기준을 확인하세요.
