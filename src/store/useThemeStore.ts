import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '~/constants/storageKeys';

export type Theme = 'light' | 'dark';

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getPreferredTheme(),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        get().setTheme(get().theme === 'light' ? 'dark' : 'light');
      },
    }),
    {
      name: STORAGE_KEYS.theme,
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? getPreferredTheme());
      },
    },
  ),
);

applyTheme(useThemeStore.getState().theme);
