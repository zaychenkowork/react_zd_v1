import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * i18n needs no provider — the default i18next instance is initialised once
 * as a side effect of importing `~/i18n/index` (see __tests__/setup/setupTests.ts),
 * and `useTranslation` reads from it directly.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
