import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

describe('App 통합 렌더', () => {
  it('헤더와 단일 뷰 대시보드가 크래시 없이 렌더된다', () => {
    render(<App />);
    expect(screen.getByText('내 집 마련 시뮬레이터')).toBeInTheDocument();
    expect(screen.getByText('순자산 시뮬레이션')).toBeInTheDocument();
    // 기본 시나리오 A는 매매 → 확정 대출액 요약 카드 노출
    expect(screen.getByText('확정 대출액')).toBeInTheDocument();
  });

  it('주거 형태를 전세로 바꾸면 전세 입력 필드가 나타난다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '전세' }));
    expect(screen.getByText('전세 보증금 (만원)')).toBeInTheDocument();
  });

  it('비교 모드 토글 시 A/B 비교 요약이 렌더된다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /비교 모드/ }));
    expect(screen.getByText('비교 요약')).toBeInTheDocument();
    expect(screen.getByText('시나리오 입력 (A / B)')).toBeInTheDocument();
  });

  it('입력 항목에 도움말(?) 아이콘이 렌더된다', () => {
    render(<App />);
    const helps = screen.getAllByRole('button', { name: '설명 보기' });
    expect(helps.length).toBeGreaterThan(0);
  });
});
