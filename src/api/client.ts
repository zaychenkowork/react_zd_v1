import axios from 'axios';

import { CONFIG } from '~/config/config';

/**
 * Deliberately bare: no auth interceptor and no error normalization, because
 * the template doesn't know the backend yet (cookie session vs bearer tokens,
 * error body shape). Ready-made recipes — cookies (`withCredentials`), bearer
 * + refresh single-flight, and `ApiError` normalization — live in
 * docs/api-layer.md; wire them in here once the backend contract is known.
 */
export const apiClient = axios.create({
  baseURL: CONFIG.API_URL,
  headers: { 'Content-Type': 'application/json' },
});
