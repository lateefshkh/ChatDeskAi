// src/lib/email/resend.ts
import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);
const FROM_EMAIL = "ChatDesk <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
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
 * @param to - Admin's email (jahan email jayegi)
 * @param verifyUrl - Full URL with token
 * @param userEmail - Original user's email (optional, for context)
 */
export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  userEmail?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: userEmail ? `Verify User: ${userEmail}` : "Verify your ChatDesk account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ChatDesk</h2>
        ${userEmail ? `<p><strong>User requesting access:</strong> ${userEmail}</p>` : ""}
        <p>Please verify this email address by clicking the button below:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour.
        </p>
      </div>
    `,
  });
}

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
          This link expires in 30 minutes and can only be used once.
        </p>
      </div>
    `,
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}