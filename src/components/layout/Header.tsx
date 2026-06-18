import { useScenarioStore } from '../../store/scenarioStore';

export function Header() {
  const comparisonMode = useScenarioStore((s) => s.comparisonMode);
  const toggle = useScenarioStore((s) => s.toggleComparison);
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            집
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-800">내 집 마련 시뮬레이터</h1>
            <p className="text-xs text-neutral-400">주거 형태 비교 · 자산 증식 시뮬레이션</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            comparisonMode
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {comparisonMode ? '비교 모드 ON' : '비교 모드'}
        </button>
      </div>
    </header>
  );
}
