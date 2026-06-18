import { InfoTooltip } from './InfoTooltip';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  help?: string;
}

export function NumberInput({ label, value, onChange, suffix, step = 1, min = 0, help }: NumberInputProps) {
  return (
    <label className="block">
      <span className="flex items-center text-xs font-medium text-neutral-500 mb-1">
        {label}
        {help && <InfoTooltip text={help} />}
      </span>
      <div className="flex items-center rounded-lg border border-neutral-200 focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600 bg-white">
        <input
          type="number"
          className="w-full px-3 py-2 text-sm text-neutral-800 bg-transparent outline-none rounded-lg"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="px-3 text-xs text-neutral-400 whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}
