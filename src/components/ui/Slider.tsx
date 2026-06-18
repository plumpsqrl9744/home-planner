import { InfoTooltip } from './InfoTooltip';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  help?: string;
}

export function Slider({ label, value, min, max, step, onChange, valueLabel, help }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center text-xs font-medium text-neutral-500">
          {label}
          {help && <InfoTooltip text={help} />}
        </span>
        {valueLabel && <span className="text-xs font-semibold text-primary-600">{valueLabel}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max <= min ? min + 1 : max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-600 cursor-pointer"
      />
    </div>
  );
}
