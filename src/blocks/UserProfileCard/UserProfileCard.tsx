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
    // eslint-disable-next-line sonarjs/todo-tag -- intentional, ui kit lands in phase 6
    // TODO: replace with ui/components/Skeleton once it lands in phase 6.
    return <div className={styles.skeleton} aria-hidden="true" />;
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
