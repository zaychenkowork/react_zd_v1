/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_DEVTOOLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;

// vite.config.ts's svgr plugin transforms every `**/*.svg` import into a React
// component (exportType: 'default'), so this overrides vite/client's generic
// `*.svg` -> string declaration for icons specifically (TS picks the more
// specific ambient module pattern).
declare module '~/assets/icons/*.svg' {
  import type { FC, SVGProps } from 'react';

  const Component: FC<SVGProps<SVGSVGElement>>;
  export default Component;
}
