import type { FC } from 'react';

import styles from './ToastMessageStyles.module.css';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const VARIANT_BORDER_COLOR: Record<ToastVariant, string> = {
  success: 'var(--color-green-500)',
  error: 'var(--color-red-500)',
  warning: 'var(--color-red-400)',
  info: 'var(--color-blue-500)',
};

export type ToastMessageProps = {
  /**
   * Visual accent of the toast.
   */
  type?: ToastVariant;

  /**
   * Already-translated message text — callers resolve i18n keys
   * (e.g. `t('errors.' + error.code)`) before rendering this component.
   */
  message: string;
};

const ToastMessage: FC<ToastMessageProps> = ({ message, type = 'info' }) => {
  return (
    <div
      className={styles.container}
      style={{ borderColor: VARIANT_BORDER_COLOR[type] }}
    >
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export { ToastMessage };
