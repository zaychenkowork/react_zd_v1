import { toast } from 'react-toastify';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import i18n from '~/i18n/index';

import type { ApiError } from '~/types/api';

import { QUERY_DEFAULT_OPTIONS } from '~/config/query';

function showErrorToast(error: ApiError) {
  // error.code is a runtime value from the backend, so it can't be a typed
  // translation key — the `errors.generic` defaultValue covers unknown codes.
  const fallback = i18n.t('errors.generic');
  const key = `errors.${error.code}` as never;
  toast.error(i18n.t(key, { defaultValue: fallback }));
}

export const queryClient = new QueryClient({
  defaultOptions: QUERY_DEFAULT_OPTIONS,
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorToast) showErrorToast(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.errorToast) showErrorToast(error);
    },
    onSuccess: (_data, _variables, _onMutateResult, mutation, context) => {
      const { meta } = mutation;
      if (meta?.successToast) {
        toast.success(i18n.t(meta.successToast as never));
      }
      meta?.invalidates?.forEach((queryKey) => {
        context.client.invalidateQueries({ queryKey });
      });
    },
  }),
});
