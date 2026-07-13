export interface ApiErrorParams {
  code: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Normalized shape every failed request is converted to by the response
 * interceptor in ~/api/client — the backend is expected to return `code`
 * so it can be mapped to an `errors.<code>` i18n key (see docs/api-layer.md).
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor({ code, status, message, details }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
