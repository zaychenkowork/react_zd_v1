import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

/**
 * react-toastify v11 injects its base stylesheet automatically; the mapping
 * of our design tokens onto `--toastify-*` variables lives in
 * ~/styles/toast.css (imported in main.tsx).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer position="bottom-right" newestOnTop />
    </>
  );
}
