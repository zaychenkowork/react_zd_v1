import { useMutation } from '@tanstack/react-query';

import { api } from '~/api/api';
import { fetcher } from '~/api/fetcher';
import { userKeys } from '~/api/queryKeys';

import type { UpdateProfileRequest } from '~/types/api';

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      fetcher(api.user.updateProfile(data)),
    meta: {
      errorToast: true,
      successToast: 'profile.updated',
      invalidates: [userKeys.profile()],
    },
  });
}
