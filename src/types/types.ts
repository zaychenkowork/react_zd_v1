/**
 * Cross-domain helper types shared by DTOs and app code.
 */

import { EUserRole } from './enums';

/** Fields every persisted backend entity is expected to carry. */
export type WithBaseEntityFields = {
  id: string;
  /*
   * ISO 8601 timestamp.
   */
  createdAt: string;
  /*
   * ISO 8601 timestamp.
   */
  updatedAt: string;
};

/**
 * Example request/response DTOs for the demo endpoints in ~/api/api.ts —
 * replace them with the real backend contract. DTOs are `type`, not
 * `interface` (see docs/conventions.md). The `ApiError` class + error
 * normalization ship as a recipe in docs/api-layer.md and land here once the
 * backend error shape is known.
 */
export type UserProfile = WithBaseEntityFields & {
  email: string;
  displayName: string;
  role: EUserRole;
};
