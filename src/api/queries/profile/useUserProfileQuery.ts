import { useQuery } from '@tanstack/react-query';

import { profileQueries } from '~/api/queries/profile/profileQueries';

export function useUserProfileQuery() {
  return useQuery(profileQueries.detail());
}
