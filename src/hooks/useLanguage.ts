import { useTranslation } from 'react-i18next';

import { isSupportedLanguage, type Language } from '~/i18n/resources';

export function useLanguage() {
  const { i18n } = useTranslation();

  const language: Language = isSupportedLanguage(i18n.language)
    ? i18n.language
    : 'en';

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  return { language, changeLanguage };
}
