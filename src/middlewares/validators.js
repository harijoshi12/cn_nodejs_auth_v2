import { body, validationResult } from "express-validator";
import { responseHandler } from "../utils/responseHandler.js";

/**
 * Validation rules for sign up
 */
export const validateSignUp = [
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler.badRequest(
        res,
        "Validation failed",
        errors.array()
      );
    }
    next();
  },
];

/**
 * Validation rules for sign in
 */
export const validateSignIn = [
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler.badRequest(
        res,
        "Validation failed",
        errors.array()
      );
    }
    next();
  },
];

/**
 * Validation rules for password reset
 */
export const validateResetPassword = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler.badRequest(
        res,
        "Validation failed",
        errors.array()
      );
    }
    next();
  },
];
