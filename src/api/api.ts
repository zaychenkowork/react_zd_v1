import { apiClient } from '~/api/client';

import type {
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UserProfile,
} from '~/types/api';

/**
 * Single flat entry point for HTTP endpoints. Methods are named
 * `<subject><HttpVerb>` — `loginPost`, `profileGet`, `profilePatch` — so a
 * method name always reads as "what + how" (see docs/api-layer.md).
 */
export const api = {
  loginPost: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),
  profileGet: () => apiClient.get<UserProfile>('/user/profile'),
  profilePatch: (data: UpdateProfileRequest) =>
    apiClient.patch<UserProfile>('/user/profile', data),
} as const;
