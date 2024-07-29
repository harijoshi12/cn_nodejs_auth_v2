import express from "express";
import passport from "passport";
import { authenticate } from "../middlewares/auth.js";
import { googleAuthCallback } from "../controllers/authController.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = express.Router();

// Page routes
router.get("/signup", (req, res) =>
  res.render("signup", {
    title: "Sign Up",
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    nonce: res.locals.nonce,
  })
);
router.get("/signin", (req, res) =>
  res.render("signin", {
    title: "Sign In",
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    nonce: res.locals.nonce,
  })
);
router.get("/forgot-password", (req, res) =>
  res.render("forgot", { title: "Forgot Password" })
);

// Protected routes
router.get("/home", authenticate, (req, res) =>
  res.render("home", { title: "Home", user: req.user })
);
router.get("/reset-password", authenticate, (req, res) =>
  res.render("reset", { title: "Reset Password" })
);

// Google authentication routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/signin",
  }),
  catchAsync(googleAuthCallback)
);

export default router;
