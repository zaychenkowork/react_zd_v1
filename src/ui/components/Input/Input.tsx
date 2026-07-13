import type { CSSProperties, FC, KeyboardEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import cn from 'classnames';

import { SpinnerLoader } from '~/ui/components/Loaders/SpinnerLoader/SpinnerLoader';
import { Icon } from '~/ui/icons/Icon';
import { Icons } from '~/ui/icons/types';

import styles from './InputStyles.module.css';

export type InputProps = {
  /**
   * Defines the type of right-side behavior/icon.
   * - `secure` — toggles password visibility (chevron rotates as the affordance —
   *   the template only ships chevron/search icons, see ui/icons/types.ts).
   * - `search` — shows a static search icon.
   */
  variant?: 'secure' | 'search';

  /**
   * Custom element displayed on the right side of the input.
   */
  rightElement?: ReactNode;

  /**
   * Current value of the input field.
   */
  value: string;

  /**
   * Error text. If provided, the input is styled as invalid and the text is
   * announced through `role="alert"`.
   */
  errorText?: string;

  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string;

  /**
   * Icon shown on the left side of the input.
   */
  decorationLeftIcon?: Icons;

  /**
   * Whether the input is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the input is editable. If `false`, the input is read-only but
   * without disabled styling.
   */
  editable?: boolean;

  /**
   * HTML input type (ignored when `variant` is `secure`).
   */
  type?: 'text' | 'email' | 'password';

  /**
   * Callback fired on value change.
   */
  setValue?: (value: string) => void;

  /**
   * Label rendered above the input.
   */
  title?: string;

  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Shows a loading spinner on the right side, taking priority over
   * `rightElement` and the variant icon.
   */
  fetching?: boolean;

  autoComplete?: string;
  autoFocus?: boolean;
  style?: CSSProperties;
  name?: string;
};

const Input: FC<InputProps> = ({
  variant,
  disabled,
  editable = true,
  decorationLeftIcon,
  value,
  setValue,
  placeholder,
  errorText,
  type = 'text',
  title,
  onKeyDown,
  fetching,
  autoComplete = 'off',
  autoFocus = false,
  rightElement,
  style,
  name,
}) => {
  const [secureEntry, setSecureEntry] = useState(true);

  const iconStrokeColor = disabled
    ? 'var(--color-grey-200)'
    : 'var(--color-grey-600)';

  const leftIcon = decorationLeftIcon ? (
    <Icon
      fillColor="transparent"
      strokeColor={iconStrokeColor}
      type={decorationLeftIcon}
    />
  ) : null;

  const resolvedRightContent = useMemo(() => {
    if (fetching)
      return (
        <SpinnerLoader
          size={18}
          strokeWidth={2}
          color="var(--color-grey-600)"
        />
      );
    if (rightElement) return rightElement;

    switch (variant) {
      case 'search':
        return (
          <Icon
            fillColor="transparent"
            strokeColor={iconStrokeColor}
            type={Icons.Search}
          />
        );
      case 'secure':
        return (
          <Icon
            fillColor="transparent"
            strokeColor={iconStrokeColor}
            type={Icons.Chevron}
            containerClassName={secureEntry ? undefined : styles.secureIconOpen}
            onClick={() => setSecureEntry((prev) => !prev)}
          />
        );
      default:
        return null;
    }
  }, [fetching, rightElement, variant, iconStrokeColor, secureEntry]);

  return (
    <div className={styles.wrapper}>
      {!!title && (
        <div className={styles.titleContainer}>
          <p className={styles.title}>{title}</p>
        </div>
      )}
      <div
        className={cn(styles.inputWrapper, {
          [styles.inputWrapperDisabled]: disabled,
          [styles.inputWrapperReadOnly]: !editable,
          [styles.inputWrapperError]: !!errorText,
        })}
        style={style}
      >
        {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
        <input
          name={name}
          aria-invalid={!!errorText}
          aria-describedby={errorText ? `${name ?? 'input'}-error` : undefined}
          className={styles.input}
          type={variant === 'secure' && secureEntry ? 'password' : type}
          autoFocus={autoFocus}
          disabled={disabled}
          readOnly={!editable}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => setValue?.(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {resolvedRightContent && (
          <div className={styles.rightIcon}>{resolvedRightContent}</div>
        )}
      </div>
      {!!errorText && (
        <p
          id={`${name ?? 'input'}-error`}
          className={styles.errorText}
          role="alert"
        >
          {errorText}
        </p>
      )}
    </div>
  );
};

export { Input };
