import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import pkg from './package.json' with { type: 'json' };

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    // Native tsconfig `paths` resolution (Vite 8) — replaces vite-tsconfig-paths.
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        titleProp: true,
        // This setting is necessary for correct fill change via parameters
        replaceAttrValues: { '#0B0B0C': 'currentColor' },
      },
      include: '**/*.svg',
    }),
  ],
});
