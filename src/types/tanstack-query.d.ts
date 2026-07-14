import type { QueryKey } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
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
