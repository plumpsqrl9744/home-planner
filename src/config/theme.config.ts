// Recharts는 CSS 클래스를 못 받으므로 hex가 필요. Tailwind 토큰과 동일 값을 한 곳에서만 정의.
export const CHART_COLORS = {
  A: '#2563eb', // primary-600
  B: '#16a34a', // success-500
} as const;
