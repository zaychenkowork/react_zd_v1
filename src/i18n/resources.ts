import arJson from './locales/ar/translation.json';
import type enTranslation from './locales/en/translation.json';
import enJson from './locales/en/translation.json';
import ukJson from './locales/uk/translation.json';

type Translation = typeof enTranslation;

ukJson satisfies Translation;
arJson satisfies Translation;

export const resources = {
  en: { translation: enJson },
  uk: { translation: ukJson },
  ar: { translation: arJson },
} as const;

export type Language = keyof typeof resources;

export const supportedLanguages = Object.keys(resources) as Language[];

export function isSupportedLanguage(code: string): code is Language {
  return (supportedLanguages as string[]).includes(code);
}
