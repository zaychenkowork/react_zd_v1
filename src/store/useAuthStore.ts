import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '~/constants/storageKeys';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: STORAGE_KEYS.authRefreshToken,
      // eslint-disable-next-line sonarjs/todo-tag -- intentional, tracked deviation
      // TODO: move the refresh token to an httpOnly cookie once the backend
      // supports it — persisting it in localStorage is a stopgap and is
      // vulnerable to XSS. accessToken is intentionally kept memory-only.
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    },
  ),
);

export const selectAccessToken = (state: AuthState) => state.accessToken;
export const selectIsAuthenticated = (state: AuthState) =>
  state.accessToken !== null;
