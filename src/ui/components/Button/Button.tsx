import type {
  ButtonHTMLAttributes,
  CSSProperties,
  FC,
  MouseEventHandler,
} from 'react';
import cn from 'classnames';

import { SpinnerLoader } from '~/ui/components/Loaders/SpinnerLoader/SpinnerLoader';
import { Icon } from '~/ui/icons/Icon';
import { Icons } from '~/ui/icons/types';

import styles from './ButtonStyles.module.css';

type Size = 'l' | 'm' | 's';

const ICON_ONLY_PADDING: Record<Size, number> = { l: 10, m: 10, s: 9 };

const SIZE_PADDING: Record<
  Size,
  { verticalPadding: number; horizontalPadding: number }
> = {
  l: { verticalPadding: 13, horizontalPadding: 24 },
  m: { verticalPadding: 9.5, horizontalPadding: 24 },
  s: { verticalPadding: 7.5, horizontalPadding: 24 },
};

export type ButtonProps = {
  /**
   * The text label displayed on the button.
   */
  label?: string;

  /**
   * The visual style of the button.
   * - `primary` — filled button
   * - `secondary` — outlined button
   * - `tertiary` — transparent, text-only
   * - `danger` — destructive action
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';

  /**
   * The size of the button.
   */
  size?: Size;

  /**
   * Icon to display next to the label, or as a standalone icon button.
   */
  icon?: Icons;

  /**
   * Position of the icon relative to the label.
   */
  iconPosition?: 'left' | 'right';

  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;

  /**
   * Whether to show a spinner instead of content. Implicitly disables the button.
   */
  loading?: boolean;

  /**
   * Callback fired on click.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;

  /**
   * Additional class name to apply to the button.
   */
  className?: string;

  /**
   * Inline styles to apply to the button.
   */
  style?: CSSProperties;

  /**
   * HTML button type.
   */
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

const Button: FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'm',
  icon,
  iconPosition = 'left',
  disabled,
  onClick,
  className,
  loading,
  style,
  type = 'button',
}) => {
  const isIconOnly = !label;
  const sizePadding = SIZE_PADDING[size];

  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        { [styles.disabled]: disabled || loading },
        className,
      )}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      style={{
        ...(isIconOnly
          ? { padding: ICON_ONLY_PADDING[size], width: 'fit-content' }
          : {
              padding: `${sizePadding.verticalPadding}px ${sizePadding.horizontalPadding}px`,
            }),
        ...(icon && label
          ? { flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse' }
          : {}),
        ...style,
      }}
    >
      {!loading ? (
        <>
          {icon && (
            <span className={styles.icon}>
              <Icon
                type={icon}
                strokeColor="currentColor"
                size={size !== 's' ? 20 : 18}
              />
            </span>
          )}
          {label && !isIconOnly && <span className={styles.text}>{label}</span>}
        </>
      ) : (
        <SpinnerLoader
          size={20}
          strokeWidth={3}
          color={
            variant === 'primary'
              ? 'var(--color-primary-0)'
              : 'var(--color-grey-400)'
          }
        />
      )}
    </button>
  );
};

export { Button };
