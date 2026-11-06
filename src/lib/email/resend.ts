// src/lib/email/resend.ts
//
// Purpose: Resend email wrapper for verification + password reset emails.
//
// Design:
// - Single Resend client instance (singleton).
// - Templates inline (v1) - future mein alag templates folder.
// - Timeout on send (5s) - hung email API shouldn't block signup.
// - Errors logged but not thrown to user (email failure != signup failure).
//
// Ye kyun zaroori hai:
// - Email verification ke bina account active nahi hota, isliye delivery reliable honi chahiye.
// - Timeout ke bina Resend API hang ho jaye to signup request hang ho jayegi.
// - Errors log karo lekin client ko generic success do - attacker ko email existence ka pata na chale.

import { Resend } from "resend";
import { env } from "@/lib/env";

// Resend client singleton
const resend = new Resend(env.RESEND_API_KEY);

// From address - free tier mein onboarding@resend.dev hi use karna padta hai
// Production mein custom domain verify karke apna email use karein
const FROM_EMAIL = "ChatDesk <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Core email sender. Timeout ke saath.
 * Returns success boolean - caller decide kare kya karna hai.
 */
async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    // 5s timeout - hung API se bachne ke liye
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    clearTimeout(timeoutId);

    if (result.error) {
      console.error("[resend] send failed:", result.error.message);
      return false;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[resend] send exception:", message);
    return false;
  }
}

/**
 * Send email verification link.
 *
 * @param to - user's email
 * @param verifyUrl - full URL with token (e.g. https://app.com/api/auth/verify-email?token=...)
 */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Verify your ChatDesk account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ChatDesk</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour. If you didn't create a ChatDesk account, ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset link.
 *
 * @param to - user's email
 * @param resetUrl - full URL with token
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Reset your ChatDesk password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy this link: <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 30 minutes and can only be used once. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Simple HTML-to-text fallback for plain-text email part.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}