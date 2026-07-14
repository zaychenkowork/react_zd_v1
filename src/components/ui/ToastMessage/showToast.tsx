import { toast, type ToastOptions } from 'react-toastify';

import {
  ToastMessage,
  type ToastVariant,
} from '~/components/ui/ToastMessage/ToastMessage';

/**
 * Programmatic toast entry point — renders the themed ToastMessage inside
 * react-toastify. `message` is already-translated text: callers resolve i18n
 * keys (e.g. `t('errors.generic')`) before calling.
 */
export function showToast(
  message: string,
  type: ToastVariant = 'info',
  options: ToastOptions = {},
) {
  toast(() => <ToastMessage message={message} type={type} />, {
    type,
    ...options,
  });
}
