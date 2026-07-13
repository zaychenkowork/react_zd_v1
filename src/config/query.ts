import type { DefaultOptions } from '@tanstack/react-query';

export const QUERY_DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  },
  mutations: {
    retry: 0,
  },
};
