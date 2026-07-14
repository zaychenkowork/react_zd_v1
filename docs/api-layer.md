# API layer

## Modules

| File | Role |
|---|---|
| `api/client.ts` | The single axios instance (`baseURL` from `~/config/config`). **Deliberately bare**: no auth interceptor and no error normalization, because the backend contract (cookie session vs bearer tokens, error body shape) isn't known at template time. Ready-made recipes below. |
| `api/fetcher.ts` | `fetcher<T>(promise: Promise<AxiosResponse<T>>): Promise<T>` — unwraps `AxiosResponse<T>` into `T`, so `api.*` can be passed straight into `queryFn`/`mutationFn`. |
| `api/api.ts` | A single **flat** entry point. Methods are named `<subject><HttpVerb>`: `loginPost`, `profileGet`, `profilePatch` — the name always reads as "what + how". Each method is a thin wrapper over `apiClient.get/post/patch/...`, with no business logic. |
| `api/queryClient.ts` | The `QueryClient` with global `QueryCache`/`MutationCache` callbacks (toasts + invalidation via `meta`, see below). Lives in the `api` layer — it's query infrastructure, not a React component; `app/providers/QueryProvider.tsx` just wraps it in `QueryClientProvider` (+ `ReactQueryDevtools` behind `CONFIG.ENABLE_DEVTOOLS`). |
| `api/queries/<domain>/<domain>Queries.ts` | The query factory of the domain: `queryOptions()` objects that colocate the query key with its `queryFn`. |
| `api/queries/<domain>/use<Name>{Query,Mutation}.ts` | `useQuery`/`useMutation` hooks, grouped by domain (`api/queries/profile/...`, future `api/queries/admin/...`). |
| `types/api.ts` | Request/response DTOs (`type`, not `interface` — see `docs/conventions.md`). |

Adding a new endpoint: a flat method in `api/api.ts` → a DTO in `types/api.ts` (if not already
there) → an entry in the domain's query factory → a hook in `api/queries/<domain>/`.

## Query factories: `queryOptions()` instead of key factories

Earlier revisions kept a standalone key factory (`api/queryKeys.ts`). The template now uses
the v5 `queryOptions()` helper to colocate keys with their query functions — TkDodo's
current recommendation: *"Separating QueryKey from QueryFunction was a mistake"*, and
combining the factory with `queryOptions` gives *"type safety, co-location and great DX"*
([tkdodo.eu, "The Query Options API"](https://tkdodo.eu/blog/the-query-options-api)).

```ts
// api/queries/profile/profileQueries.ts
export const profileQueries = {
  all: () => ['profile'] as const,
  detail: () =>
    queryOptions({
      queryKey: [...profileQueries.all(), 'detail'] as const,
      queryFn: () => fetcher(api.profileGet()),
    }),
};

// api/queries/profile/useUserProfileQuery.ts
export function useUserProfileQuery() {
  return useQuery(profileQueries.detail());
}
```

Mutations reuse the same keys for invalidation: `invalidates: [profileQueries.all()]`
invalidates the whole domain, `profileQueries.detail().queryKey` a single query. The
factories also work directly with `queryClient.prefetchQuery(profileQueries.detail())`,
`getQueryData(profileQueries.detail().queryKey)` (typed via data tagging), etc.

## Toasts and errors — strictly opt-in

No toasts by default. Behavior is enabled via `meta` on a specific query/mutation — the `meta`
typing (the `Register` interface from TanStack Query) is declared in
`src/types/tanstack-query.d.ts`. That mechanism —
`declare module '@tanstack/react-query' { interface Register { ... } }` — is the official
one ([TanStack Query TypeScript docs, "Typing meta"](https://tanstack.com/query/latest/docs/framework/react/typescript));
the docs put no requirement on where the augmentation file lives, `types/` is simply the
template's home for ambient declarations.

```ts
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { errorToast?: boolean };
    mutationMeta: {
      errorToast?: boolean;
      successToast?: string;
      invalidates?: QueryKey[];
    };
  }
}
```

- `meta.errorToast: true` → the global `QueryCache`/`MutationCache` (`api/queryClient.ts`)
  shows `showToast(t('errors.generic'), 'error')`. (With the `ApiError` recipe below wired
  in, map `errors.<error.code>` instead of the generic fallback.)
- `meta.successToast: '<i18n-key>'` → `showToast(t(key), 'success')` on mutation success.
- `meta.invalidates: QueryKey[]` → `invalidateQueries` for each key on mutation success.

Example (`api/queries/profile/useUpdateProfileMutation.ts`):

```ts
export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => fetcher(api.profilePatch(data)),
    meta: {
      errorToast: true,
      successToast: 'profile.updated',
      invalidates: [profileQueries.all()],
    },
  });
}
```

**Why global cache callbacks rather than per-call `onError`:** v5 removed `onError` from
`useQuery` on purpose — a per-observer callback fires once per hook instance (two
components using the same query would show two toasts for one failed request), while the
global `QueryCache.onError` fires once per query. The global-callback-plus-`meta` pattern
is the maintainer-sanctioned replacement:
[tkdodo.eu, "React Query Error Handling"](https://tkdodo.eu/blog/react-query-error-handling)
and [tkdodo.eu, "Breaking React Query's API on purpose"](https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose)
(the `meta` section shows exactly this shape), plus the
[`MutationCache` reference](https://tanstack.com/query/latest/docs/reference/MutationCache).

The toast itself is `showToast(message, type, options?)` from
`components/ui/ToastMessage/showToast.tsx` — it renders the themed `ToastMessage`
component through react-toastify and takes already-translated text. Components can call it
directly for one-off notifications; the global caches call the same helper.

Default query settings (`config/query.ts`): `staleTime` 60s, `gcTime` 5m, `retry` 2 for
queries / 0 for mutations.

## Auth: pick a recipe when the backend lands

The template doesn't presume an auth mechanism. `store/useAuthStore` keeps only an
`isAuthenticated` flag; how it gets set depends on which of the recipes below you wire in.

### Recipe A — cookie session (what zedxbroker uses)

The backend sets an httpOnly session cookie; the client just opts into sending it:

```ts
export const apiClient = axios.create({
  baseURL: CONFIG.API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

No token storage on the client at all (that's the main XSS win). `isAuthenticated` is
derived from a successful `profileGet()` on app start and flipped by login/logout calls.
Add a response interceptor that catches the first `401` and calls
`useAuthStore.getState().logout()` if you want automatic session-expiry handling.

### Recipe B — bearer tokens

Extend `useAuthStore` with tokens (memory-only `accessToken`; if you must persist the
refresh token, `persist` + `partialize` to localStorage is a stopgap — prefer an httpOnly
cookie for it) and attach the header in a request interceptor:

```ts
import { useAuthStore } from '~/store/useAuthStore';

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});
```

Note: this makes `api/` import `store/` — relax the corresponding
`import-x/no-restricted-paths` zone in `eslint.config.js` when wiring it in.

### Recipe C — error normalization (`ApiError`)

When the backend's error body is known, normalize every failure into one shape so nothing
above the client ever sees axios-specific errors:

```ts
// types/api.ts (or api/ApiError.ts — it's runtime code, not just a type)
export type ApiErrorParams = {
  code: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor({ code, status, message, details }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// api/client.ts
function normalizeError(error: AxiosError): ApiError {
  const data = error.response?.data as
    | { code?: string; message?: string; details?: Record<string, unknown> }
    | undefined;

  return new ApiError({
    code: data?.code ?? 'UNKNOWN_ERROR',
    status: error.response?.status ?? 0,
    message: data?.message ?? error.message,
    details: data?.details,
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalizeError(error)),
);
```

**Backend requirement: return `code`** in the error body (`{ code, message, details }`) —
it's specifically `code`, not `status` or `message`, that maps to the translation key
`errors.<code>`. Without a `code` from the backend, the error normalizes to
`code: 'UNKNOWN_ERROR'` and the user sees `errors.generic`. Once wired in, also register
the error type globally (`interface Register { defaultError: ApiError }` in
`types/tanstack-query.d.ts`) and switch `showErrorToast` in `api/queryClient.ts` to
`t('errors.' + error.code, { defaultValue: t('errors.generic') })`.

### Recipe D — refresh token, single-flight (extends Recipe B)

Wire this into `~/api/client.ts` as soon as the backend has a working `POST /auth/refresh`
(add `refreshPost` to `~/api/api.ts`) — until then, any 401 simply propagates up like every
other status. The key idea is single-flight: while one token-refresh request is in flight,
other concurrent 401 requests don't hit `/auth/refresh` again — they wait in a queue and
get replayed with the new token.

```ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { api } from '~/api/api';
import { useAuthStore } from '~/store/useAuthStore';

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

  const { data } = await api.refreshPost(refreshToken);
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
      return Promise.reject(error);
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
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
```

(Combining with Recipe C: wrap the final `Promise.reject(error)` calls in
`normalizeError(...)`.)
