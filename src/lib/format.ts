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
