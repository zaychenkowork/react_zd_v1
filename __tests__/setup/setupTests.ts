import '@testing-library/jest-dom';

import i18n from '~/i18n/index';

// SVG imports go through the real vite-plugin-svgr transform (vitest.config.ts
// mirrors vite.config.ts's setup), so icons render for real in tests — no
// separate SVG mock module is needed.
await i18n.changeLanguage('en');

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
