import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

describe('App 통합 렌더', () => {
  it('공통 기본정보와 단일 뷰 대시보드가 크래시 없이 렌더된다', () => {
    render(<App />);
    expect(screen.getByText('내 집 마련 시뮬레이터')).toBeInTheDocument();
    expect(screen.getByText(/공통 기본정보/)).toBeInTheDocument();
    expect(screen.getByText('순자산 시뮬레이션')).toBeInTheDocument();
    // 기본 시나리오 A는 매매 → 레버리지 분석 노출
    expect(screen.getByText(/레버리지 분석/)).toBeInTheDocument();
  });

  it('공통 기본정보에 ETF·부동산 가정 입력이 포함된다', () => {
    render(<App />);
    expect(screen.getByText('ETF 연수익률 (%)')).toBeInTheDocument();
    expect(screen.getByText('부동산 연상승률 (%)')).toBeInTheDocument();
  });

  it('매매 시나리오에 대출 슬라이더가 렌더된다', () => {
    render(<App />);
    expect(screen.getByText('대출 받을 금액')).toBeInTheDocument();
    expect(screen.getByText(/최대 대출 가능/)).toBeInTheDocument();
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
  });

  it('입력 항목에 도움말(?) 아이콘이 렌더된다', () => {
    render(<App />);
    const helps = screen.getAllByRole('button', { name: '설명 보기' });
    expect(helps.length).toBeGreaterThan(0);
  });
});
