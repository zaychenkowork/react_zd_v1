import { Skeleton } from '~/ui/components/Skeleton/Skeleton';

import { useUserProfileQuery } from '~/api/queries/profile/useUserProfileQuery';

import styles from './UserProfileCardStyles.module.css';

/**
 * Reusable block with business logic (queries) — the "widgets" layer from
 * FSD, see docs/architecture.md (written in phase 10) for the blocks/ vs
 * ui/ split.
 */
export function UserProfileCard() {
  const { data, isPending, isError } = useUserProfileQuery();

  if (isPending) {
    return <Skeleton loading height="4.5rem" width="20rem" />;
  }

  // The global QueryCache (see app/providers/QueryProvider.tsx) already
  // surfaces an error toast, so there is nothing else to render here.
  if (isError) return null;

  return (
    <div className={styles.card}>
      <p className={styles.name}>{data.displayName}</p>
      <p className={styles.email}>{data.email}</p>
    </div>
  );
}
