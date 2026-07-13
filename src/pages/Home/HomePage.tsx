import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UserProfileCard } from '~/blocks/UserProfileCard/UserProfileCard';

import { Button } from '~/ui/components/Button/Button';
import { ModalCore } from '~/ui/components/ModalCore/ModalCore';

import styles from './HomePageStyles.module.css';

export default function HomePage() {
  const { t } = useTranslation();
  // Parent-owned modal: this page holds isOpen and hands it to ModalCore as
  // props — see docs/modals.md (phase 10) for when to promote this to the
  // global useModalStore + ModalHost recipe instead.
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <h1 className="text-heading">{t('home.title')}</h1>
      <p className="text-body">{t('home.subtitle')}</p>

      <section className={styles.section}>
        <h2 className="text-heading">{t('home.profileSectionTitle')}</h2>
        <UserProfileCard />
      </section>

      <section className={styles.section}>
        <h2 className="text-heading">{t('home.openModalSectionTitle')}</h2>
        <Button
          label={t('home.openModal')}
          onClick={() => setModalOpen(true)}
          style={{ width: 'fit-content' }}
        />
        <ModalCore
          isOpen={isModalOpen}
          setOpen={setModalOpen}
          title={t('home.demoModalTitle')}
          description={t('home.demoModalDescription')}
          confirmAction={() => setModalOpen(false)}
          cancelAction={() => setModalOpen(false)}
        />
      </section>
    </div>
  );
}
