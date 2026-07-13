import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { STORAGE_KEYS } from '~/constants/storageKeys';

import { resources, supportedLanguages } from './resources';

function applyTextDirection(lang: string) {
  document.documentElement.dir = i18n.dir(lang);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.language,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

applyTextDirection(i18n.language);
i18n.on('languageChanged', applyTextDirection);

export default i18n;
