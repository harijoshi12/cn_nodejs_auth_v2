import jwt from "jsonwebtoken";

/**
 * Generate a JWT token
 * @param {Object} user - User object
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
export const generateToken = (user, expiresIn = "1d") => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
