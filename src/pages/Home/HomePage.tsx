import { useTranslation } from 'react-i18next';

import styles from './HomePageStyles.module.css';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1 className="text-heading">{t('home.title')}</h1>
      <p className="text-body">{t('home.subtitle')}</p>
    </div>
  );
}
