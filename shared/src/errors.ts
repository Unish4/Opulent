export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'LOOKUP_NOT_SUPPORTED',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'PLAYER_NOT_FOUND',
  'STATE_CONFLICT',
  'DUPLICATE_RESOURCE',
  'PRICE_CHANGED',
  'RATE_LIMITED',
  'LOOKUP_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  LOOKUP_NOT_SUPPORTED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PLAYER_NOT_FOUND: 404,
  STATE_CONFLICT: 409,
  DUPLICATE_RESOURCE: 409,
  PRICE_CHANGED: 409,
  RATE_LIMITED: 429,
  LOOKUP_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
  };
}

export interface ApiSuccess<T> {
  data: T;
  meta?: { page: number; limit: number; total: number };
}