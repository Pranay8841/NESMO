import { Resend } from "resend";
import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";
import crypto from "crypto";

/**
 * @fileoverview Email Sender Utility
 * Priority: Brevo (free, no domain needed) > Resend (needs domain) > Nodemailer (local only)
 * 
 * Brevo: 300 emails/day FREE, no domain verification needed
 * Resend: Requires verified domain for production use
 * Nodemailer: Gmail SMTP blocked from most cloud server IPs, use for local dev only
 * 
 * @module utils/emailSender
 */

// Initialize Brevo if API key is available (preferred for production - FREE)
let brevoClient = null;
if (process.env.BREVO_API_KEY) {
  brevoClient = new Brevo.TransactionalEmailsApi();
  brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Initialize Resend if API key is available (production with verified domain)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Nodemailer transporter for local development fallback
 */
const createNodemailerTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Generate email HTML template for verification
 */
const getVerificationEmailHtml = (firstName, verificationLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">NESMO</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Navodaya Alumni Network</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome, ${firstName}!</h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for registering with the NESMO Alumni Network. To complete your registration and access all features, please verify your email address.
              </p>
              <table role="presentation" style="margin: 32px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); border-radius: 8px;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 48px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 24px; word-break: break-all;">
                <a href="${verificationLink}" style="color: #4F46E5; font-size: 14px;">${verificationLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with NESMO, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} NESMO Alumni Network. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generate email HTML template for password reset
 */
const getPasswordResetEmailHtml = (firstName, resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">NESMO</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Navodaya Alumni Network</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi ${firstName}, we received a request to reset your password for your NESMO Alumni Network account. Click the button below to create a new password.
              </p>
              <table role="presentation" style="margin: 32px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); border-radius: 8px;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 48px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 24px; word-break: break-all;">
                <a href="${resetLink}" style="color: #4F46E5; font-size: 14px;">${resetLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                <strong>Note:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} NESMO Alumni Network. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Send verification email to user
 * Priority: Brevo > Resend > Nodemailer
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} verificationToken - Email verification token
 */
export const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;
  const html = getVerificationEmailHtml(firstName, verificationLink);
  const text = `Welcome to NESMO Alumni Network, ${firstName}!\n\nPlease verify your email address by clicking the link below:\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with NESMO, please ignore this email.`;

  const subject = "Verify Your Email - NESMO Alumni Network";

  // Priority 1: Brevo (FREE - 300 emails/day, no domain needed)
  if (brevoClient) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;
      sendSmtpEmail.sender = { 
        name: "NESMO Alumni Network", 
        email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM 
      };
      sendSmtpEmail.to = [{ email, name: firstName }];

      const result = await brevoClient.sendTransacEmail(sendSmtpEmail);
      console.log("Verification email sent via Brevo to:", email, "MessageId:", result.body?.messageId);
      return true;
    } catch (error) {
      console.error("Error sending verification email via Brevo:", error.response?.body || error);
      throw new Error("Failed to send verification email");
    }
  }

  // Priority 2: Resend (requires verified domain)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "NESMO <onboarding@resend.dev>",
        to: email,
        subject,
        html,
        text,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(error.message);
      }

      console.log("Verification email sent via Resend:", data?.id);
      return true;
    } catch (error) {
      console.error("Error sending verification email via Resend:", error);
      throw new Error("Failed to send verification email");
    }
  }

  // Priority 3: Nodemailer for local development
  try {
    const transporter = createNodemailerTransporter();
    await transporter.sendMail({
      from: `"NESMO Alumni Network" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      text,
    });
    console.log("Verification email sent via Nodemailer to:", email);
    return true;
  } catch (error) {
    console.error("Error sending verification email via nodemailer:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Generate a random verification token
 * @returns {string} Random token (64 characters hex)
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Send password reset email to user
 * Priority: Brevo > Resend > Nodemailer
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password/${resetToken}`;
  const html = getPasswordResetEmailHtml(firstName, resetLink);
  const text = `Hi ${firstName},\n\nWe received a request to reset your password for your NESMO Alumni Network account.\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`;

  const subject = "Reset Your Password - NESMO Alumni Network";

  // Priority 1: Brevo (FREE - 300 emails/day, no domain needed)
  if (brevoClient) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;
      sendSmtpEmail.sender = { 
        name: "NESMO Alumni Network", 
        email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM 
      };
      sendSmtpEmail.to = [{ email, name: firstName }];

      const result = await brevoClient.sendTransacEmail(sendSmtpEmail);
      console.log("Password reset email sent via Brevo to:", email, "MessageId:", result.body?.messageId);
      return true;
    } catch (error) {
      console.error("Error sending password reset email via Brevo:", error.response?.body || error);
      throw new Error("Failed to send password reset email");
    }
  }

  // Priority 2: Resend (requires verified domain)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "NESMO <onboarding@resend.dev>",
        to: email,
        subject,
        html,
        text,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(error.message);
      }

      console.log("Password reset email sent via Resend:", data?.id);
      return true;
    } catch (error) {
      console.error("Error sending password reset email via Resend:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  // Priority 3: Nodemailer for local development
  try {
    const transporter = createNodemailerTransporter();
    await transporter.sendMail({
      from: `"NESMO Alumni Network" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      text,
    });
    console.log("Password reset email sent via Nodemailer to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email via nodemailer:", error);
    throw new Error("Failed to send password reset email");
  }
};

export default {
  sendVerificationEmail,
  generateVerificationToken,
  sendPasswordResetEmail,
};
