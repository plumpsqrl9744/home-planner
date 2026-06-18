import { Controller, type Control, type FieldValues, type FieldPath } from 'react-hook-form';
import { NumberInput } from '../NumberInput';

// 폼 값은 도메인 단위(원/소수)로 저장하고, 화면 표시는 만원/% 단위로 변환한다.
const FACTOR = { manwon: 10_000, percent: 0.01, plain: 1 } as const;

interface FormNumberInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  help?: string;
  step?: number;
  unit?: keyof typeof FACTOR;
}

export function FormNumberInput<T extends FieldValues>({ control, name, label, help, step, unit = 'plain' }: FormNumberInputProps<T>) {
  const factor = FACTOR[unit];
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <NumberInput
          label={label}
          help={help}
          step={step}
          value={(Number(field.value) || 0) / factor}
          onChange={(v) => field.onChange(v * factor)}
        />
      )}
    />
  );
}
