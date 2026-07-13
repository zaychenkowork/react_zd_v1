import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import i18n from '~/i18n/index';

import { ApiError } from '~/types/api';

import { CONFIG } from '~/config/config';
import { QUERY_DEFAULT_OPTIONS } from '~/config/query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    queryMeta: {
      suppressErrorToast?: boolean;
    };
    mutationMeta: {
      suppressErrorToast?: boolean;
      successToast?: string;
      invalidates?: QueryKey[];
    };
  }
}

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
      if (query.meta?.suppressErrorToast) return;
      showErrorToast(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.suppressErrorToast) return;
      showErrorToast(error);
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

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {CONFIG.ENABLE_DEVTOOLS && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
