import { useQuery } from '@tanstack/react-query';

import { api } from '~/api/api';
import { fetcher } from '~/api/fetcher';
import { userKeys } from '~/api/queryKeys';

export function useUserProfileQuery() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => fetcher(api.user.profile()),
  });
}
