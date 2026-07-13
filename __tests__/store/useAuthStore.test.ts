import { beforeEach, describe, expect, it } from 'vitest';

import {
  selectAccessToken,
  selectIsAuthenticated,
  useAuthStore,
} from '~/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearTokens();
  });

  it('has no access token and reports as unauthenticated by default', () => {
    expect(selectAccessToken(useAuthStore.getState())).toBeNull();
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });

  it('stores both tokens and reports as authenticated when setTokens is called', () => {
    useAuthStore
      .getState()
      .setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    expect(selectAccessToken(useAuthStore.getState())).toBe('access-1');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-1');
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it('clears both tokens when clearTokens is called', () => {
    useAuthStore
      .getState()
      .setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    useAuthStore.getState().clearTokens();

    expect(selectAccessToken(useAuthStore.getState())).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });
});
