import { describe, it, expect } from 'vitest';
import { formatKRW, formatPercent } from './format';

describe('formatKRW', () => {
  it('억 단위', () => {
    expect(formatKRW(600_000_000)).toBe('6억');
  });
  it('억+만 단위', () => {
    expect(formatKRW(615_000_000)).toBe('6억 1,500만');
  });
  it('만 단위', () => {
    expect(formatKRW(15_000_000)).toBe('1,500만');
  });
  it('0', () => {
    expect(formatKRW(0)).toBe('0원');
  });
  it('음수', () => {
    expect(formatKRW(-15_000_000)).toBe('-1,500만');
  });
});

describe('formatPercent', () => {
  it('소수를 %로', () => {
    expect(formatPercent(0.04)).toBe('4%');
  });
  it('소수점 한자리', () => {
    expect(formatPercent(0.035)).toBe('3.5%');
  });
});
