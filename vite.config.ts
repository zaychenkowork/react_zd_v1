import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
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
