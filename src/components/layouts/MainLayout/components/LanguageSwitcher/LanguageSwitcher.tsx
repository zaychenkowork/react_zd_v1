import { useTranslation } from 'react-i18next';

import { useLanguage } from '~/hooks/useLanguage';

import type { Language } from '~/i18n/resources';
import { supportedLanguages } from '~/i18n/resources';

import { LANGUAGE_NAMES } from '~/constants/languages';

import styles from './LanguageSwitcherStyles.module.css';

// eslint-disable-next-line sonarjs/todo-tag -- intentional, ui kit lands in phase 6
// TODO: swap the plain <select> for a ui/components brick once the ui kit
// lands in phase 6 — kept page-local for the same reason as ThemeSwitcher.
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <select
      className={styles.select}
      aria-label={t('language.label')}
      value={language}
      onChange={(event) => changeLanguage(event.target.value as Language)}
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_NAMES[lang]}
        </option>
      ))}
    </select>
  );
}
