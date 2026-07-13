import type { StorybookConfig } from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // The react-vite framework doesn't read the project's vite.config.ts, so the
  // svgr plugin (icons as components, see src/ui/icons/types.ts) has to be
  // re-added here too — same fix as vitest.config.ts (SETUP_NOTES phase 8).
  async viteFinal(viteConfig) {
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
