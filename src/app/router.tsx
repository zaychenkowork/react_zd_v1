import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router';

import { MainLayout } from '~/pages/layouts/MainLayout/MainLayout';

import { ROUTES } from '~/config/routes';

const HomePage = lazy(() => import('~/pages/Home/HomePage'));
const NotFoundPage = lazy(() => import('~/pages/NotFound/NotFoundPage'));

function PageLoader() {
  const { t } = useTranslation();
  return <div role="status">{t('common.loading')}</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.notFound} element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
