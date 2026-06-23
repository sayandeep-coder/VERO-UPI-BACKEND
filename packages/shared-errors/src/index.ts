export type ErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details: ErrorDetails | undefined;
  public readonly isOperational = true;

  public constructor(code: string, message: string, httpStatus = 500, details?: ErrorDetails) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  public constructor(message = "Request validation failed", details?: ErrorDetails) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  public constructor(message = "Authentication is required") {
    super("UNAUTHENTICATED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  public constructor(message = "You do not have permission to perform this action") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends AppError {
  public constructor(message = "Resource was not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  public constructor(message = "Resource conflict", details?: ErrorDetails) {
    super("CONFLICT", message, 409, details);
  }
}
