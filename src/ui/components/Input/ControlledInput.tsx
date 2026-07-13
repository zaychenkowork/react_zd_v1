import type { FieldValues, UseControllerProps } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { InputProps } from './Input';
import { Input } from './Input';

export type ControlledInputProps<T extends FieldValues> = Omit<
  InputProps,
  'value' | 'setValue' | 'errorText' | 'name'
> &
  UseControllerProps<T>;

function ControlledInput<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  ...rest
}: ControlledInputProps<T>) {
  const { t } = useTranslation();
  const { field, fieldState } = useController({
    name,
    control,
    rules,
    defaultValue,
  });
  const errorMessage = fieldState.error?.message;

  return (
    <Input
      name={field.name}
      value={field.value ?? ''}
      setValue={(value) => field.onChange(value)}
      // Zod issue messages are runtime i18n keys (see schemas/loginSchema.ts),
      // so the literal key union can't be checked statically — same pattern
      // as showErrorToast in app/providers/queryClient.ts.
      errorText={
        errorMessage ? t(`validation.${errorMessage}` as never) : undefined
      }
      {...rest}
    />
  );
}

export { ControlledInput };
