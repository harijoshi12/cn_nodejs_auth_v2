// src/app.js
import express from "express";
import passport from "passport";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import crypto from "crypto";

// Load environment variables
dotenv.config();

// Import configurations and routes
import "./config/passport-setup.js";
import apiRoutes from "./routes/api.js";
import pageRoutes from "./routes/pages.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";

const app = express();

// Setup for ES module file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a nonce for inline scripts
const generateNonce = () => {
  return crypto.randomBytes(16).toString("base64");
};

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(helmet());

// Helmet configuration with CSP
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           "https://www.google.com",
//           "https://www.gstatic.com",
//           // Use a nonce for inline scripts
//           (req, res) => `'nonce-${res.locals.nonce}'`,
//         ],
//         styleSrc: ["'self'", "https://fonts.googleapis.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com"],
//         imgSrc: ["'self'", "data:", "https://upload.wikimedia.org"],
//         frameSrc: ["'self'", "https://www.google.com"],
//       },
//     },
//   })
// );

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Passport middleware
app.use(passport.initialize());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Set nonce for inline scripts
app.use((req, res, next) => {
  res.locals.nonce = generateNonce();
  next();
});

// Routes
app.get("/", (req, res) => res.redirect("/auth/signin"));
app.use("/api/v1", apiRoutes);
app.use("/auth", pageRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;
