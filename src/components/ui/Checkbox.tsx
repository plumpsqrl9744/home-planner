import { InfoTooltip } from './InfoTooltip';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  help?: string;
}

export function Checkbox({ label, checked, onChange, description, help }: CheckboxProps) {
  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        id={`cb-${label}`}
        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 accent-primary-600 cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={`cb-${label}`} className="cursor-pointer select-none">
        <span className="flex items-center text-sm text-neutral-700">
          {label}
          {help && <InfoTooltip text={help} />}
        </span>
        {description && <span className="block text-xs text-neutral-400">{description}</span>}
      </label>
    </div>
  );
}
