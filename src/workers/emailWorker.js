import { parentPort, workerData } from "worker_threads";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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
 * Send email
 * @param {Object} emailData - Email data
 */
const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const info = await transporter.sendMail({
      from: `Your App <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    parentPort.postMessage({ success: true, messageId: info.messageId });
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  }
};

sendEmail(workerData);
