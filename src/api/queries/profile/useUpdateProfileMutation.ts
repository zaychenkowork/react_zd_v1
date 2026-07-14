import { useMutation } from '@tanstack/react-query';

import { api } from '~/api/api';
import { fetcher } from '~/api/fetcher';
import { profileQueries } from '~/api/queries/profile/profileQueries';

import type { UpdateProfileRequest } from '~/types/api';

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => fetcher(api.profilePatch(data)),
    meta: {
      errorToast: true,
      successToast: 'profile.updated',
      invalidates: [profileQueries.all()],
    },
  });
}
