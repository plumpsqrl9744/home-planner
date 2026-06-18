/**
 * 라벨 옆 ? 아이콘. hover/포커스 시 설명 말풍선을 띄운다.
 * 순수 CSS(group-hover)라 상태 관리가 없다. text의 줄바꿈(\n)은 그대로 렌더된다.
 */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label="설명 보기"
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 text-[10px] font-bold leading-none text-white cursor-help hover:bg-primary-600 focus:bg-primary-600 focus:outline-none"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-72 whitespace-pre-line rounded-lg bg-neutral-800 px-3 py-2.5 text-xs font-normal leading-relaxed text-neutral-50 shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
