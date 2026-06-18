export type HousingType = 'happy' | 'jeonse' | 'purchase';

export interface CommonInput {
  cash: number; // 보유 현금 (원)
  annualIncome: number; // 부부합산 연소득 (원)
  monthlyLiving: number; // 월 생활비 (원)
  creditLoan: number; // 기존 신용대출 잔액 (원)
}

export interface HappyInput {
  type: 'happy';
  deposit: number; // 보증금
  monthlyRent: number; // 월세
  managementFee: number; // 관리비(월)
}

export interface JeonseInput {
  type: 'jeonse';
  deposit: number; // 전세 보증금
  loanLimit: number; // 전세자금대출 한도
  loanRate: number; // 전세자금대출 금리 (연, 소수)
  managementFee: number; // 관리비(월)
}

export interface PurchaseInput {
  type: 'purchase';
  price: number; // 주택 가격
  desiredLoan: number; // 희망 대출액(원). 상한(min LTV/DSR)으로 클램프됨. 레버리지 의사결정 변수
  loanRate: number; // 주담대 금리 (연, 소수)
  loanMaturityYears: number; // 대출 만기 (년)
  managementFee: number; // 관리비(월)
}

export type HousingInput = HappyInput | JeonseInput | PurchaseInput;

export interface PolicyFlags {
  isFirstHome: boolean; // 생애최초 주택구매
  stressDsr: boolean; // 스트레스 DSR 적용
  districtCode: string; // 자치구 코드
}

export interface InvestInput {
  etfReturnRate: number; // ETF 연수익률 (소수)
  realEstateGrowthRate: number; // 부동산 연상승률 (소수)
}

export interface Scenario {
  label: string;
  common: CommonInput;
  housing: HousingInput;
  policy: PolicyFlags;
  invest: InvestInput;
}

/** 공통 기본정보 — 시나리오 A/B가 공유한다(한 번 입력하면 양쪽 자동 반영). */
export interface BasicInfo {
  cash: number; // 보유 현금 (원)
  annualIncome: number; // 부부합산 연소득 (원)
  monthlyLiving: number; // 월 생활비 (원)
  creditLoan: number; // 기존 신용대출 잔액 (원)
  etfReturnRate: number; // ETF 연수익률 (소수)
  realEstateGrowthRate: number; // 부동산 연상승률 (소수)
}

/** 시나리오별 설정 — 주거 형태와 정책. 공통 기본정보와 합쳐 Scenario가 된다. */
export interface ScenarioConfig {
  label: string;
  housing: HousingInput;
  policy: PolicyFlags;
}
