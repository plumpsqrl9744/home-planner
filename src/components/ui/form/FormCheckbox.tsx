import { Controller, type Control, type FieldValues, type FieldPath } from 'react-hook-form';
import { Checkbox } from '../Checkbox';

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  help?: string;
}

export function FormCheckbox<T extends FieldValues>({ control, name, label, description, help }: FormCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Checkbox
          label={label}
          description={description}
          help={help}
          checked={!!field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
