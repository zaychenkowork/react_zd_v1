import { describe, expect, it } from 'vitest';

import { envSchema } from '~/schemas/env';

/**
 * config/env.ts reads import.meta.env at import time (the only file allowed
 * to, per eslint no-restricted-syntax), so it can't be exercised with
 * different inputs in a test. envSchema is the pure validation logic behind
 * it — testing it here covers the same behaviour without touching
 * import.meta.env.
 */
describe('envSchema', () => {
  it('parses a valid VITE_API_URL and defaults VITE_ENABLE_DEVTOOLS to false', () => {
    const result = envSchema.safeParse({
      VITE_API_URL: 'http://localhost:3000',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      VITE_API_URL: 'http://localhost:3000',
      VITE_ENABLE_DEVTOOLS: false,
    });
  });

  it('transforms VITE_ENABLE_DEVTOOLS="true" into boolean true', () => {
    const result = envSchema.safeParse({
      VITE_API_URL: 'http://localhost:3000',
      VITE_ENABLE_DEVTOOLS: 'true',
    });

    expect(result.success).toBe(true);
    expect(result.data?.VITE_ENABLE_DEVTOOLS).toBe(true);
  });

  it('fails when VITE_API_URL is not a valid URL', () => {
    const result = envSchema.safeParse({ VITE_API_URL: 'not-a-url' });

    expect(result.success).toBe(false);
  });

  it('fails when VITE_API_URL is missing', () => {
    const result = envSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
