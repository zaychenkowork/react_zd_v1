import { queryOptions } from '@tanstack/react-query';

import { api } from '~/api/api';
import { fetcher } from '~/api/fetcher';

/**
 * Query factory for the profile domain — `queryOptions()` colocates the key
 * with its queryFn (https://tkdodo.eu/blog/the-query-options-api). Mutations
 * reuse the same keys for invalidation: `profileQueries.all()` invalidates
 * the whole domain, `profileQueries.detail().queryKey` a single query.
 */
export const profileQueries = {
  all: () => ['profile'] as const,
  detail: () =>
    queryOptions({
      queryKey: [...profileQueries.all(), 'detail'] as const,
      queryFn: () => fetcher(api.profileGet()),
    }),
};
