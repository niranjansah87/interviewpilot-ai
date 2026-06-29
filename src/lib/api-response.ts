/**
 * Standardized API response envelope.
 * All successful API responses use this structure.
 */

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface ApiMeta {
  requestId: string;
  traceId: string;
  timestamp: string;
  version: string;
}

export type ApiResponse<T> = ApiSingleResponse<T> | ApiListResponse<T>;

/**
 * Wraps a single item in the standard envelope.
 */
export function apiItem<T>(data: T, meta: ApiMeta): ApiSingleResponse<T> & { meta: ApiMeta } {
  return { data, meta };
}

/**
 * Wraps a paginated list in the standard envelope.
 */
export function apiList<T>(
  data: T[],
  pagination: ApiListResponse<T>['pagination'],
  meta: ApiMeta,
): ApiListResponse<T> & { meta: ApiMeta } {
  return { data, pagination, meta };
}

/**
 * Standardized error response shape.
 */
export interface ApiErrorResponse {
  detail: string;
  code: string;
  field?: string;
  requestId?: string;
}

/**
 * Builds an ApiErrorResponse from error details.
 */
export function apiError(
  code: string,
  detail: string,
  requestId?: string,
  field?: string,
): ApiErrorResponse {
  return { code, detail, requestId, ...(field ? { field } : {}) };
}
