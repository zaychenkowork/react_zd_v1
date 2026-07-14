import { useTranslation } from 'react-i18next';

import { useTheme } from '~/hooks/useTheme';

import styles from './ThemeSwitcherStyles.module.css';

// eslint-disable-next-line sonarjs/todo-tag -- intentional, ui kit lands in phase 6
// TODO: swap the plain <button> for ui/components/Button once it lands in
// phase 6 — this component is store-connected so it stays page-local
// (pages/<Layout>/components/) rather than in ui/, see docs/architecture.md.
export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={t('theme.toggleLabel')}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? t('theme.light') : t('theme.dark')}
    </button>
  );
}
