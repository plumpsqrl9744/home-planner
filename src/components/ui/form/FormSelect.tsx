import { Controller, type Control, type FieldValues, type FieldPath } from 'react-hook-form';
import { Select } from '../Select';

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: { value: string; label: string }[];
  help?: string;
}

export function FormSelect<T extends FieldValues>({ control, name, label, options, help }: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select label={label} help={help} options={options} value={field.value} onChange={field.onChange} />
      )}
    />
  );
}
