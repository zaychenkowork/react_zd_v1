import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';

import { LanguageSwitcher } from '~/pages/layouts/MainLayout/components/LanguageSwitcher/LanguageSwitcher';
import { ThemeSwitcher } from '~/pages/layouts/MainLayout/components/ThemeSwitcher/ThemeSwitcher';

import { selectIsAuthenticated, useAuthStore } from '~/store/useAuthStore';

import { CONFIG } from '~/config/config';
import { ROUTES } from '~/config/routes';

import styles from './MainLayoutStyles.module.css';

export function MainLayout() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to={ROUTES.home} className={styles.logo}>
          {CONFIG.APP_NAME}
        </Link>
        <nav className={styles.nav}>
          <ThemeSwitcher />
          <LanguageSwitcher />
          {/* eslint-disable-next-line sonarjs/todo-tag -- intentional, auth pages land in phase 6 */}
          {/* TODO: replace with the real account menu once auth pages exist. */}
          {!isAuthenticated && <Link to={ROUTES.login}>{t('nav.login')}</Link>}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
