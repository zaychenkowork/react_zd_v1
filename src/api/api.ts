import { apiClient } from '~/api/client';

import type {
  AuthTokensResponse,
  LoginRequest,
  UpdateProfileRequest,
  UserProfile,
} from '~/types/api';

export const api = {
  auth: {
    login: (data: LoginRequest) =>
      apiClient.post<AuthTokensResponse>('/auth/login', data),
    refresh: (refreshToken: string) =>
      apiClient.post<AuthTokensResponse>('/auth/refresh', { refreshToken }),
  },
  user: {
    profile: () => apiClient.get<UserProfile>('/user/profile'),
    updateProfile: (data: UpdateProfileRequest) =>
      apiClient.patch<UserProfile>('/user/profile', data),
  },
} as const;
