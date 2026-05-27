/**
 * Standardized error classes for consistent error handling across the app.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields: string[] = []) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Extract a user-friendly error message from unknown error types.
 * Never exposes stack traces or internal details in production.
 */
export function getUserErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.isOperational) {
    return error.message;
  }
  if (error instanceof Error) {
    // In development, show the real message; in production, hide internals
    if (import.meta.env.DEV) return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log an error with context. Only logs to console in development.
 * In production, this would forward to an error tracking service.
 */
export function logError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error, metadata ?? '');
  }
  // Production: forward to monitoring service (e.g., Sentry, Datadog)
}
