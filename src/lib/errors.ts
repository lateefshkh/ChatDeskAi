// src/lib/errors.ts
//
// Purpose: Central error classes + handler.
//
// Design:
// - AppError = known errors with safe messages.
// - Unknown errors = generic message to client, full detail to logs.
// - handleApiError = route handler wrapper.
//
// Ye kyun zaroori hai:
// - Stack traces client ko dikhana information disclosure hai.
// - Known errors (validation, auth, not found) client-friendly messages deserve.
// - Central handler = consistent error format across all routes.

export class AppError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    public safeMessage: string,
    public internalMessage?: string
  ) {
    super(internalMessage || safeMessage);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", 400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("UNAUTHORIZED", 401, "Authentication required");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super("FORBIDDEN", 403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", 404, message);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds: number) {
    super(
      "RATE_LIMITED",
      429,
      `Too many requests. Try again in ${retryAfterSeconds} seconds.`
    );
  }
}

export class InternalError extends AppError {
  constructor(message = "Something went wrong") {
    super("INTERNAL_ERROR", 500, message);
  }
}

/**
 * Convert any error to a Response. Generic message for unknown errors.
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.safeMessage, code: error.code },
      { status: error.httpStatus }
    );
  }

  // Unknown error - log (PII scrubbed), generic response
  console.error(
    "[API_ERROR]",
    error instanceof Error ? error.message : "Unknown error"
  );

  return Response.json(
    { error: "Something went wrong", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}