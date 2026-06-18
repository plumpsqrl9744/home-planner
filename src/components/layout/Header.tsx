export function Header({ comparison, onToggle }: { comparison: boolean; onToggle: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            집
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-800">내 집 마련 시뮬레이터</h1>
            <p className="text-xs text-neutral-400">레버리지·투자 배분으로 자산 증식 비교</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            comparison ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {comparison ? '비교 모드 ON' : '비교 모드'}
        </button>
      </div>
    </header>
  );
}
