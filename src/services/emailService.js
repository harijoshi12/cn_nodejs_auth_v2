import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Run email worker
 * @param {Object} emailData - Email data
 * @returns {Promise}
 */
const runEmailWorker = (emailData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, "../workers/emailWorker.js"),
      {
        workerData: emailData,
      }
    );
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

/**
 * Send welcome email
 * @param {Object} user - User object
 */
export const sendWelcomeEmail = async (user) => {
  const { email, name } = user;
  const subject = "Welcome to Your App";
  const text = `Hello ${name},\n\nWelcome to Your App! We're glad to have you with us.`;
  const html = `<h1>Welcome to Your App!</h1><p>Hello ${name},</p><p>We're glad to have you with us.</p>`;

  await runEmailWorker({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const { email, name } = user;
  const subject = "Password Reset Request";
  const resetUrl = `http://localhost:5000/auth/reset-password/${resetToken}`;
  const text = `Hello ${name},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}`;
  const html = `<h1>Password Reset Request</h1><p>Hello ${name},</p><p>You requested a password reset. Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`;

  await runEmailWorker({ to: email, subject, text, html });
};
