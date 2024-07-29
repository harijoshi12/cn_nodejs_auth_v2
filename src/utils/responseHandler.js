import { AppError } from "./AppError.js";

/**
 * Standard response object
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {number} status - HTTP status code
 * @property {string} message - Human-readable message
 * @property {*} [data] - Response payload (optional)
 * @property {Object} [error] - Error details (optional)
 */

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} [data] - Response payload (optional)
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    status: statusCode,
    message: message,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} [error] - Detailed error information (optional)
 */
const sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    status: statusCode,
    message: message,
  };

  if (error !== null && process.env.NODE_ENV === "development") {
    response.error = error;
  }

  res.status(statusCode).json(response);
};

/**
 * Handles API responses
 */
export const responseHandler = {
  ok: (res, message, data) => sendSuccess(res, 200, message, data),
  created: (res, message, data) => sendSuccess(res, 201, message, data),
  badRequest: (res, message, error) => sendError(res, 400, message, error),
  unauthorized: (res, message, error) => sendError(res, 401, message, error),
  forbidden: (res, message, error) => sendError(res, 403, message, error),
  notFound: (res, message, error) => sendError(res, 404, message, error),
  serverError: (res, message, error) => sendError(res, 500, message, error),
};

/**
 * Handle cast errors from MongoDB
 * @param {Error} err - The original error object
 * @returns {AppError} A formatted AppError instance
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle duplicate field errors from MongoDB
 * @param {Error} err - The original error object
 * @returns {AppError} A formatted AppError instance
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle validation errors from MongoDB
 * @param {Error} err - The original error object
 * @returns {AppError} A formatted AppError instance
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 * @returns {AppError} A formatted AppError instance
 */
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

/**
 * Handle JWT expiration errors
 * @returns {AppError} A formatted AppError instance
 */
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/**
 * Global error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendError(res, err.statusCode, err.message, {
      error: err,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    if (error.isOperational) {
      sendError(res, error.statusCode, error.message);
    } else {
      // Programming or other unknown error: don't leak error details
      console.error("ERROR 💥", error);
      sendError(res, 500, "Something went very wrong!");
    }
  }
};
