import type { UserProfile } from '~/types/types';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: UserProfile;
};

export type UpdateProfileRequest = Partial<Pick<UserProfile, 'displayName'>>;
