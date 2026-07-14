import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, VisuallyHidden } from 'radix-ui';

import { Button } from '~/components/ui/Button/Button';

import styles from './ModalCoreStyles.module.css';

export type ModalCoreProps = {
  /**
   * Controls whether the modal is open or closed.
   */
  isOpen: boolean;

  /**
   * Callback to set the open state — passed straight to Radix's `onOpenChange`,
   * so it also fires on overlay click and Escape.
   */
  setOpen: (open: boolean) => void;

  /**
   * Title text. Rendered visually-hidden (but still in the accessibility
   * tree) when omitted — Radix's Dialog requires a title for screen readers.
   */
  title?: string;

  /**
   * Description text displayed below the title.
   */
  description?: string;

  /**
   * Called when the confirm button is clicked. Button is only rendered when provided.
   */
  confirmAction?: () => void;

  /**
   * Called when the cancel button is clicked. Button is only rendered when provided.
   */
  cancelAction?: () => void;

  /**
   * Shows a loading spinner on the confirm button and disables both actions.
   */
  loading?: boolean;

  /**
   * Whether to show the close (X) button in the corner.
   * @default true
   */
  hasCloseButton?: boolean;

  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
};

const ModalCore: FC<ModalCoreProps> = ({
  isOpen,
  setOpen,
  title,
  description,
  confirmAction,
  cancelAction,
  loading = false,
  hasCloseButton = true,
  confirmText,
  cancelText,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay}>
          <Dialog.Content className={styles.content}>
            {title ? (
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            ) : (
              <VisuallyHidden.Root asChild>
                <Dialog.Title>{t('common.close')}</Dialog.Title>
              </VisuallyHidden.Root>
            )}
            {!!description && (
              <Dialog.Description className={styles.description}>
                {description}
              </Dialog.Description>
            )}
            {children}
            {(!!cancelAction || !!confirmAction) && (
              <div className={styles.actions}>
                {!!cancelAction && (
                  <Button
                    variant="secondary"
                    label={cancelText ?? t('common.cancel')}
                    onClick={cancelAction}
                    disabled={loading}
                  />
                )}
                {!!confirmAction && (
                  <Button
                    variant="primary"
                    label={confirmText ?? t('common.save')}
                    onClick={confirmAction}
                    loading={loading}
                  />
                )}
              </div>
            )}
            {hasCloseButton && (
              <Dialog.Close asChild>
                <button
                  className={styles.closeButton}
                  aria-label={t('common.close')}
                  type="button"
                >
                  ×
                </button>
              </Dialog.Close>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { ModalCore };
