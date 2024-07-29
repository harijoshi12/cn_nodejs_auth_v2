import { AppError } from "../utils/AppError.js";
import { responseHandler } from "../utils/responseHandler.js";

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
    responseHandler.serverError(res, err.message, {
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
      responseHandler.serverError(res, error.statusCode, error.message);
    } else {
      // Programming or other unknown error: don't leak error details
      console.error("ERROR 💥", error);
      responseHandler.serverError(res, 500, "Something went very wrong!");
    }
  }
};
