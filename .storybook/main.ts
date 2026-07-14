import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // The react-vite framework doesn't read the project's vite.config.ts, so the
  // svgr plugin (icons as components, see src/components/ui/Icon/types.ts) has to be
  // re-added here too — same fix as vitest.config.ts (see docs/testing.md).
  async viteFinal(viteConfig) {
    // Vite's native resolve.tsconfigPaths doesn't apply to importers inside
    // this dot-directory (.storybook/preview.ts), so the `~` alias from
    // tsconfig.app.json is declared explicitly here.
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        '~': fileURLToPath(new URL('../src', import.meta.url)),
      },
    };
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          titleProp: true,
          replaceAttrValues: { '#0B0B0C': 'currentColor' },
        },
        include: '**/*.svg',
      }),
    );
    return viteConfig;
  },
};

export default config;
