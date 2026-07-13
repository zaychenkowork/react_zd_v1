import { useMutation } from '@tanstack/react-query';

import { api, type UpdateProfileRequest } from '~/api/api';
import { fetcher } from '~/api/fetcher';
import { userKeys } from '~/api/queryKeys';

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      fetcher(api.user.updateProfile(data)),
    meta: {
      successToast: 'profile.updated',
      invalidates: [userKeys.profile()],
    },
  });
}
