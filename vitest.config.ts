import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Native tsconfig `paths` resolution (Vite 8) — replaces vite-tsconfig-paths.
    tsconfigPaths: true,
  },
  // Mirrors vite.config.ts's svgr setup so icons render for real in tests —
  // see src/vite-env.d.ts for the matching `~/ui/icons/svg/*.svg` ambient
  // module declaration.
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        ref: true,
        titleProp: true,
        replaceAttrValues: { '#0B0B0C': 'currentColor' },
      },
      include: '**/*.svg',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup/setupTests.ts',
    css: true,
    // .claude/worktrees holds live git worktrees of background agent
    // sessions — full repo copies that must never leak into test runs.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*', 'src/ui/components/**/*', 'src/store/**/*'],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 75,
        functions: 70,
      },
    },
  },
});
