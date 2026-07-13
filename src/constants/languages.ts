import type { Language } from '~/i18n/resources';

/**
 * Endonyms: each language named in itself, never translated — a user stuck
 * in a foreign locale must still be able to find their own language.
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  uk: 'Українська',
  ar: 'العربية',
};
