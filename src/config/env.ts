import { envSchema } from '~/schemas/env';

/**
 * Only file allowed to read `import.meta.env` (see eslint no-restricted-syntax).
 * Every other module gets typed, validated values from here.
 */
const rawEnv = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
