export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "STATE_CONFLICT"
  | "DUPLICATE_RESOURCE"
  | "PRICE_CHANGED"
  | "RATE_LIMITED"
  | "LOOKUP_NOT_SUPPORTED"
  | "PLAYER_NOT_FOUND"
  | "LOOKUP_UNAVAILABLE"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiErrorDetail {
  path: string;
  message: string;
}

const DEFAULT_CODES: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "STATE_CONFLICT",
  429: "RATE_LIMITED",
  503: "SERVICE_UNAVAILABLE",
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ApiErrorDetail[];
  public readonly isOperational = true;

  constructor(
    statusCode: number,
    message: string,
    code?: ErrorCode,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? DEFAULT_CODES[statusCode] ?? "INTERNAL_ERROR";
    this.details = details;
  }
}
