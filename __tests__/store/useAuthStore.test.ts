import { beforeEach, describe, expect, it } from 'vitest';

import { selectIsAuthenticated, useAuthStore } from '~/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('reports as unauthenticated by default', () => {
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });

  it('reports as authenticated after setAuthenticated(true)', () => {
    useAuthStore.getState().setAuthenticated(true);

    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it('resets the flag on logout', () => {
    useAuthStore.getState().setAuthenticated(true);

    useAuthStore.getState().logout();

    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });
});
