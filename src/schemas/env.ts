import { z } from 'zod';

export const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_ENABLE_DEVTOOLS: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;
