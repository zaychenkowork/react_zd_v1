import { beforeEach, describe, expect, it } from 'vitest';

import { useThemeStore } from '~/store/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.dataset.theme = 'light';
  });

  it('applies the data-theme attribute when setTheme is called', () => {
    useThemeStore.getState().setTheme('dark');

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('switches from light to dark when toggleTheme is called', () => {
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('switches back to light on a second toggleTheme call', () => {
    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('light');
  });
});
