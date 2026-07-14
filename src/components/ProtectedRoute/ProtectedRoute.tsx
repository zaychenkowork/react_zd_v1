import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { ROUTES } from '~/config/routes';

type ProtectedRouteProps = {
  isAllowed: boolean;
  redirectPath?: string;
  children?: ReactNode;
};

/**
 * Not wired into any route yet — no protected pages exist until auth forms
 * land in phase 6. Usage: <Route element={<ProtectedRoute isAllowed={...} />}>.
 */
export function ProtectedRoute({
  isAllowed,
  redirectPath = ROUTES.login,
  children,
}: ProtectedRouteProps) {
  if (!isAllowed) return <Navigate to={redirectPath} replace />;
  return children ?? <Outlet />;
}
