import express from "express";
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  forgotPassword,
  resetPasswordWithToken,
} from "../controllers/authController.js";
import {
  validateSignUp,
  validateSignIn,
  validateResetPassword,
} from "../middlewares/validators.js";
import { authenticate } from "../middlewares/auth.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = express.Router();

// API routes
router.post("/signup", validateSignUp, catchAsync(signUp));
router.post("/signin", validateSignIn, catchAsync(signIn));
router.post("/signout", authenticate, catchAsync(signOut));
router.post(
  "/reset-password",
  authenticate,
  validateResetPassword,
  catchAsync(resetPassword)
);
router.post("/forgot-password", catchAsync(forgotPassword));
router.post("/reset-password/:token", catchAsync(resetPasswordWithToken));

export default router;
