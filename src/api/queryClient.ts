import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { showToast } from '~/components/ui/ToastMessage/showToast';

import i18n from '~/i18n/index';

import { QUERY_DEFAULT_OPTIONS } from '~/config/query';

function showErrorToast() {
  // The template's client doesn't normalize backend errors (the backend
  // contract isn't known yet) — once the ApiError recipe from
  // docs/api-layer.md is wired in, map `errors.<error.code>` here instead of
  // the generic fallback.
  showToast(i18n.t('errors.generic'), 'error');
}

export const queryClient = new QueryClient({
  defaultOptions: QUERY_DEFAULT_OPTIONS,
  queryCache: new QueryCache({
    onError: (_error, query) => {
      if (query.meta?.errorToast) showErrorToast();
    },
  }),
  mutationCache: new MutationCache({
    onError: (_error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.errorToast) showErrorToast();
    },
    onSuccess: (_data, _variables, _onMutateResult, mutation, context) => {
      const { meta } = mutation;
      if (meta?.successToast) {
        showToast(i18n.t(meta.successToast as never), 'success');
      }
      meta?.invalidates?.forEach((queryKey) => {
        context.client.invalidateQueries({ queryKey });
      });
    },
  }),
});
