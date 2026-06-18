import '@testing-library/jest-dom';

// jsdom에는 ResizeObserver가 없어 recharts ResponsiveContainer가 실패한다. 테스트용 폴리필.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as typeof ResizeObserver);
