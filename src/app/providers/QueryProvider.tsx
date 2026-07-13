import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '~/app/providers/queryClient';

import { CONFIG } from '~/config/config';

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {CONFIG.ENABLE_DEVTOOLS && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
