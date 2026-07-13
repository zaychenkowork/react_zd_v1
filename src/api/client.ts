import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '~/store/useAuthStore';

import { ApiError } from '~/types/api';

import { CONFIG } from '~/config/config';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: CONFIG.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

interface QueueEntry {
  resolve: (accessToken: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

function flushQueue(error: unknown, accessToken?: string) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !accessToken) reject(error);
    else resolve(accessToken);
  });
  refreshQueue = [];
}

// eslint-disable-next-line sonarjs/todo-tag -- intentional placeholder, see docs/api-layer.md once written in phase 10
// TODO: implement once the backend exposes a refresh endpoint
// (planned as `api.auth.refresh`). The single-flight queue below is ready —
// only the actual request is missing.
function refreshAccessToken(): Promise<string> {
  return Promise.reject(
    new Error('Token refresh endpoint is not implemented yet.'),
  );
}

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
  async (error: AxiosError) => {
    const originalRequest = error.config as
      InternalAxiosRequestConfig | undefined;

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
