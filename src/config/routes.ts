export const ROUTES = {
  home: '/',
  login: '/login',
  notFound: '*',
  username: (name: string) => `/u/${name}`,
} as const;
