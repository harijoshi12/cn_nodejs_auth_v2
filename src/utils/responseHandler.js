/**
 * src/utils/responseHandler.js
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
