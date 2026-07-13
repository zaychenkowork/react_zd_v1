import { env } from '~/config/env';

export const CONFIG = {
  APP_NAME: 'react-zd-v1',
  APP_VERSION: __APP_VERSION__,
  API_URL: env.VITE_API_URL,
  ENABLE_DEVTOOLS: env.VITE_ENABLE_DEVTOOLS,
} as const;
