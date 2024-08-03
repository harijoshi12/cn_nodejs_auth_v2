/**
 * src/utils/AppError.js
 * Custom application error class
 * @extends Error
 */
export class AppError extends Error {
  /**
   * Create a new AppError instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Set status based on status code (4xx: fail, 5xx: error)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Used to distinguish operational errors from programming errors
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for bad requests
 * @extends AppError
 */
export class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/**
 * Custom error class for not found errors
 * @extends AppError
 */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

/**
 * Custom error class for unauthorized errors
 * @extends AppError
 */
export class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

/**
 * Custom error class for internal server errors
 * @extends AppError
 */
export class InternalServerError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}
