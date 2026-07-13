import type { QueryKey } from '@tanstack/react-query';

import type { ApiError } from '~/types/api';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    queryMeta: {
      errorToast?: boolean;
    };
    mutationMeta: {
      errorToast?: boolean;
      successToast?: string;
      invalidates?: QueryKey[];
    };
  }
}
