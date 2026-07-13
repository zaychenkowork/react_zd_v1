import * as z from 'zod';

/**
 * Error messages are i18n keys under `validation.*` (see
 * src/i18n/locales/*\/translation.json) — Controlled-input wrappers translate
 * `fieldState.error.message` through `t('validation.' + message)`.
 */
export const loginSchema = z.object({
  email: z.string('required').min(1, 'required').pipe(z.email('invalidEmail')),
  password: z.string('required').min(1, 'required').min(8, 'minLength'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
