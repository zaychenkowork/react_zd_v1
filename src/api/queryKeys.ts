/**
 * Query key factory — https://tkdodo.eu/blog/effective-react-query-keys
 */
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};
