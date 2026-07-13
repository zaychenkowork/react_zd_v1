# API-слой

## Модули

| Файл | Роль |
|---|---|
| `api/client.ts` | Единственный axios instance (`baseURL` из `~/config/config`). Request-интерсептор кладёт `Authorization: Bearer <accessToken>` из `useAuthStore.getState()`. Response-интерсептор нормализует **любую** ошибку в `ApiError` (см. ниже) — выше по стеку (query/mutation `queryFn`) уже нет axios-специфичных ошибок. |
| `api/fetcher.ts` | `fetcher<T>(promise: Promise<AxiosResponse<T>>): Promise<T>` — разворачивает `AxiosResponse<T>` в `T`, чтобы `api.*` можно было передавать прямо в `queryFn`/`mutationFn`. |
| `api/api.ts` | Единая точка входа по доменам: `api.auth.*`, `api.user.*`. Каждый метод — тонкая обёртка над `apiClient.get/post/patch/...`, без бизнес-логики. |
| `api/queryKeys.ts` | Фабрика query-ключей по домену (`userKeys.all`, `userKeys.profile()`), паттерн [tkdodo.eu, «Effective React Query Keys»](https://tkdodo.eu/blog/effective-react-query-keys). |
| `api/queries/<domain>/use<Name>{Query,Mutation}.ts` | Хуки `useQuery`/`useMutation`, группированные по домену (`api/queries/profile/...`, будущие `api/queries/admin/...`). |
| `types/api.ts` | DTO запросов/ответов (`type`, не `interface` — см. `docs/conventions.md`) + класс `ApiError`. |

Добавление нового эндпоинта: метод в `api/api.ts` → DTO в `types/api.ts` (если ещё нет) → ключ в
`queryKeys.ts` (если новый домен) → хук в `api/queries/<domain>/`.

## Схема ошибок

Response-интерсептор `api/client.ts` превращает любую ошибку axios в `ApiError`:

```ts
export type ApiErrorParams = {
  code: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};
```

**Требование к бэку: отдавать `code`** в теле ошибки (`{ code, message, details }`) — именно
`code`, не `status` и не `message`, маппится на ключ перевода `errors.<code>` (см. ниже). Без
`code` от бэка ошибка нормализуется в `code: 'UNKNOWN_ERROR'`, и пользователь увидит
`errors.generic`.

## Тосты и ошибки — строго opt-in

Никаких тостов по умолчанию. Поведение включается через `meta` на конкретном query/mutation —
типизация `meta` (`Register` interface из TanStack Query) объявлена в
`src/types/tanstack-query.d.ts`, а не в провайдере:

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

- `meta.errorToast: true` → глобальный `QueryCache`/`MutationCache` (`app/providers/queryClient.ts`)
  показывает `toast.error(t('errors.' + error.code, { defaultValue: t('errors.generic') }))`.
- `meta.successToast: '<i18n-ключ>'` → `toast.success(t(key))` при успехе мутации.
- `meta.invalidates: QueryKey[]` → `invalidateQueries` для каждого ключа при успехе мутации.

Пример (`api/queries/profile/useUpdateProfileMutation.ts`):

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

Обоснование выбора места (глобальные кэши, а не `onError` на каждом вызове) —
[TanStack Query docs, `MutationCache`](https://tanstack.com/query/latest/docs/reference/MutationCache),
[tkdodo.eu, «React Query Error Handling»](https://tkdodo.eu/blog/react-query-error-handling).

`QueryClient` и его кэши — `app/providers/queryClient.ts`; `app/providers/QueryProvider.tsx` —
только компонент-обёртка (`QueryClientProvider` + `ReactQueryDevtools` за `CONFIG.ENABLE_DEVTOOLS`).
Настройки по умолчанию (`config/query.ts`): `staleTime` 60s, `gcTime` 5m, `retry` 2 для queries /
0 для mutations.

## Refresh token: готовый рецепт single-flight

Включать этот код в `~/api/client.ts`, как только backend отдаёт рабочий `POST /auth/refresh`
(`api.auth.refresh` уже объявлен в `~/api/api.ts`) — до этого момента любой 401 просто
нормализуется в `ApiError` и пробрасывается наверх, как и все остальные статусы. Ключевая идея —
single-flight: пока идёт один запрос на обновление токена, остальные параллельные 401-запросы
не бьют `/auth/refresh` повторно, а ждут результата в очереди и переигрываются с новым токеном.

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
