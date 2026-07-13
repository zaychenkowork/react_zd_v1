# API layer

## Modules

| File | Role |
|---|---|
| `api/client.ts` | The single axios instance (`baseURL` from `~/config/config`). A request interceptor attaches `Authorization: Bearer <accessToken>` from `useAuthStore.getState()`. A response interceptor normalizes **any** error into `ApiError` (see below) — further up the stack (the query/mutation `queryFn`) there are no more axios-specific errors. |
| `api/fetcher.ts` | `fetcher<T>(promise: Promise<AxiosResponse<T>>): Promise<T>` — unwraps `AxiosResponse<T>` into `T`, so `api.*` can be passed straight into `queryFn`/`mutationFn`. |
| `api/api.ts` | A single entry point organized by domain: `api.auth.*`, `api.user.*`. Each method is a thin wrapper over `apiClient.get/post/patch/...`, with no business logic. |
| `api/queryKeys.ts` | A query key factory per domain (`userKeys.all`, `userKeys.profile()`), the pattern from [tkdodo.eu, "Effective React Query Keys"](https://tkdodo.eu/blog/effective-react-query-keys). |
| `api/queries/<domain>/use<Name>{Query,Mutation}.ts` | `useQuery`/`useMutation` hooks, grouped by domain (`api/queries/profile/...`, future `api/queries/admin/...`). |
| `types/api.ts` | Request/response DTOs (`type`, not `interface` — see `docs/conventions.md`) + the `ApiError` class. |

Adding a new endpoint: a method in `api/api.ts` → a DTO in `types/api.ts` (if not already there) → a
key in `queryKeys.ts` (if it's a new domain) → a hook in `api/queries/<domain>/`.

## Error shape

The `api/client.ts` response interceptor turns any axios error into an `ApiError`:

```ts
export type ApiErrorParams = {
  code: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};
```

**Backend requirement: return `code`** in the error body (`{ code, message, details }`) — it's
specifically `code`, not `status` or `message`, that maps to the translation key `errors.<code>`
(see below). Without a `code` from the backend, the error is normalized to
`code: 'UNKNOWN_ERROR'`, and the user sees `errors.generic`.

## Toasts and errors — strictly opt-in

No toasts by default. Behavior is enabled via `meta` on a specific query/mutation — the `meta`
typing (the `Register` interface from TanStack Query) is declared in
`src/types/tanstack-query.d.ts`, not in the provider:

```ts
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    queryMeta: { errorToast?: boolean };
    mutationMeta: {
      errorToast?: boolean;
      successToast?: string;
      invalidates?: QueryKey[];
    };
  }
}
```

- `meta.errorToast: true` → the global `QueryCache`/`MutationCache` (`app/providers/queryClient.ts`)
  shows `toast.error(t('errors.' + error.code, { defaultValue: t('errors.generic') }))`.
- `meta.successToast: '<i18n-key>'` → `toast.success(t(key))` on mutation success.
- `meta.invalidates: QueryKey[]` → `invalidateQueries` for each key on mutation success.

Example (`api/queries/profile/useUpdateProfileMutation.ts`):

```ts
export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => fetcher(api.user.updateProfile(data)),
    meta: {
      errorToast: true,
      successToast: 'profile.updated',
      invalidates: [userKeys.profile()],
    },
  });
}
```

Rationale for this placement (global caches rather than `onError` on every call) —
[TanStack Query docs, `MutationCache`](https://tanstack.com/query/latest/docs/reference/MutationCache),
[tkdodo.eu, "React Query Error Handling"](https://tkdodo.eu/blog/react-query-error-handling).

`QueryClient` and its caches — `app/providers/queryClient.ts`; `app/providers/QueryProvider.tsx` —
just a wrapper component (`QueryClientProvider` + `ReactQueryDevtools` behind `CONFIG.ENABLE_DEVTOOLS`).
Default settings (`config/query.ts`): `staleTime` 60s, `gcTime` 5m, `retry` 2 for queries /
0 for mutations.

## Refresh token: a ready-made single-flight recipe

Wire this code into `~/api/client.ts` as soon as the backend has a working `POST /auth/refresh`
(`api.auth.refresh` is already declared in `~/api/api.ts`) — until then, any 401 is simply
normalized into `ApiError` and propagated up, like every other status. The key idea is
single-flight: while one token-refresh request is in flight, other concurrent 401 requests
don't hit `/auth/refresh` again — they wait in a queue and get replayed with the new token.

```ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { api } from '~/api/api';
import { useAuthStore } from '~/store/useAuthStore';
import { ApiError } from '~/types/api';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

type QueueEntry = {
  resolve: (accessToken: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

function flushQueue(error: unknown, accessToken?: string) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !accessToken) reject(error);
    else resolve(accessToken);
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token available.');

  const { data } = await api.auth.refresh(refreshToken);
  setTokens(data);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | InternalAxiosRequestConfig
      | undefined;

    const isUnauthorized = error.response?.status === 401;
    if (!isUnauthorized || !originalRequest || originalRequest._retry) {
      return Promise.reject(normalizeError(error));
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (accessToken) => {
            originalRequest.headers.set(
              'Authorization',
              `Bearer ${accessToken}`,
            );
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const accessToken = await refreshAccessToken();
      flushQueue(null, accessToken);
      originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
      return await apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError);
      useAuthStore.getState().clearTokens();
      return Promise.reject(normalizeError(error));
    } finally {
      isRefreshing = false;
    }
  },
);
```
