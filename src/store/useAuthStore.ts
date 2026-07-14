import { create } from 'zustand';

/**
 * Minimal client-side auth flag. How it gets set depends on the backend's
 * auth style (cookie session vs bearer tokens) — the token-based variant
 * (persist middleware, refresh single-flight) ships as a recipe in
 * docs/api-layer.md.
 */
type AuthState = {
  isAuthenticated: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ isAuthenticated: false }),
}));

export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
