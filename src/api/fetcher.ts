import type { AxiosResponse } from 'axios';

/**
 * Unwraps `AxiosResponse<T>` -> `T` for use as a React Query queryFn/mutationFn.
 *
 * @example
 * queryFn: () => fetcher(api.user.profile())
 */
export function fetcher<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  return request.then((response) => response.data);
}
