<!-- Полная документация api-слоя (client/api/fetcher/queryKeys/queries, схема тостов и ошибок) пишется в фазе 10. Этот файл пока содержит только рецепт ниже, выделенный из ~/api/client.ts по замечанию ревью фазы 4-5. -->

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
