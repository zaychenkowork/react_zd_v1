import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ROUTES } from '~/config/routes';

import styles from './NotFoundPageStyles.module.css';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1 className="text-heading">{t('notFound.title')}</h1>
      <p className="text-body">{t('notFound.description')}</p>
      <Link to={ROUTES.home}>{t('notFound.backHome')}</Link>
    </div>
  );
}
