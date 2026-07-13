import axios, { type AxiosError } from 'axios';

import { useAuthStore } from '~/store/useAuthStore';

import { ApiError } from '~/types/api';

import { CONFIG } from '~/config/config';

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
