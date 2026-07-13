import { Outlet } from 'react-router';

import styles from './AuthLayoutStyles.module.css';

/**
 * Centered shell for auth pages (login/register). Not wired into the router
 * yet — no auth pages exist until forms land in phase 6.
 */
export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <Outlet />
      </div>
    </div>
  );
}
