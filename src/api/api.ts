import { apiClient } from '~/api/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

export type UpdateProfileRequest = Partial<Pick<UserProfile, 'displayName'>>;

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
