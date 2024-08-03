import User from "../models/User.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";
import { generateToken, verifyToken } from "../services/jwtService.js";
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from "../utils/AppError.js";
import { verifyRecaptcha } from "../services/recaptchaService.js";
import { responseHandler } from "../utils/responseHandler.js";
import crypto from "crypto";

/**
 * Handle user sign up
 */
export const signUp = async (req, res) => {
  const {
    email,
    password,
    name,
    "g-recaptcha-response": recaptchaToken,
  } = req.body;

  // Verify reCAPTCHA
  if (!recaptchaToken) {
    return responseHandler.badRequest(res, "reCAPTCHA token is missing");
  }
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken, "signup");
  if (!recaptchaVerified) {
    return responseHandler.badRequest(res, "reCAPTCHA verification failed");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return responseHandler.badRequest(res, "Email already in use");
  }

  const user = new User({ email, password, name });
  await user.save();

  // Send welcome email asynchronously
  sendWelcomeEmail(user).catch(console.error);

  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  responseHandler.created(res, "User created successfully");
};

/**
 * Handle user sign in
 */
export const signIn = async (req, res) => {
  const { email, password, "g-recaptcha-response": recaptchaToken } = req.body;

  // Verify reCAPTCHA
  if (!recaptchaToken) {
    return responseHandler.badRequest(res, "reCAPTCHA token is missing");
  }
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken, "signin");
  if (!recaptchaVerified) {
    return responseHandler.badRequest(res, "reCAPTCHA verification failed");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler.notFound(res, "User not found");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return responseHandler.badRequest(res, "Incorrect password");
  }

  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  responseHandler.ok(res, "Signed in successfully");
};

/**
 * Handle user sign out
 */
export const signOut = (req, res) => {
  res.clearCookie("token");
  responseHandler.ok(res, "Signed out successfully");
};

/**
 * Handle password reset
 */
export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return responseHandler.badRequest(res, "Incorrect old password");
  }

  user.password = newPassword;
  await user.save();

  responseHandler.ok(res, "Password reset successfully");
};

/**
 * Handle forgot password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return responseHandler.notFound(res, "No user found with this email");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  try {
    // Send password reset email asynchronously
    sendPasswordResetEmail(user, resetToken).catch(console.error);
    responseHandler.ok(res, "Password reset email sent");
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return responseHandler.serverError(
      res,
      "Failed to send password reset email. Please try again later."
    );
  }
};

/**
 * Handle password reset with token
 */
export const resetPasswordWithToken = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return responseHandler.badRequest(
      res,
      "Password reset token is invalid or has expired"
    );
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  responseHandler.ok(res, "Password has been reset successfully");
};

/**
 * Handle Google OAuth callback
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const token = generateToken(req.user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.redirect("/auth/home");
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect("/auth/signin");
  }
};
