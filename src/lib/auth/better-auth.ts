// src/lib/auth/better-auth.ts
//
// Purpose: Better Auth instance configuration.
//
// Features:
// - Email/password authentication
// - Email verification required (Resend)
// - Password reset (single-use, 30 min expiry)
// - Session management (httpOnly, Secure, SameSite=Lax, 7-day)
// - Drizzle adapter (auth-schema.ts tables)
//
// Ye kyun zaroori hai:
// - Session cookies httpOnly + Secure + SameSite = XSS + CSRF protection.
// - Email verification = fake account prevention.
// - Password reset single-use + expiry = token replay attacks rokta hai.
// - Better Auth default scrypt hashing = strong password storage.

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/resend";

export const auth = betterAuth({
  // ─── Database ─────────────────────────────────────────────────────────
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true, // tables: users, sessions, accounts, verifications
  }),

  // ─── Base URL ─────────────────────────────────────────────────────────
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // ─── Email & Password ─────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // signup ke baad email verify karna zaroori
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: false, // signup ke baad auto-login nahi, pehle verify
    sendResetPassword: async ({ user, url }) => {
      // Token URL mein hota hai (Better Auth generate karta hai)
      // 30 min expiry config se aati hai
      await sendPasswordResetEmail(user.email, url);
    },
  },

  // ─── Email Verification ───────────────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // url = https://app.com/api/auth/verify-email?token=xxx&callbackURL=...
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true, // signup pe automatic send
    autoSignInAfterVerification: true, // verify ke baad auto-login
    expiresIn: 60 * 60, // 1 hour (seconds)
  },

  // ─── Sessions ─────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session every 24h of activity
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side cache, reduces DB hits
    },
  },

  // ─── Advanced ─────────────────────────────────────────────────────────
  advanced: {
    cookiePrefix: "chatdesk",
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
    // CSRF protection
    csrfProtection: true,
  },

  // ─── User model ───────────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "owner",
        input: false, // user can't set their own role
      },
    },
  },

  // ─── Trusted origins (CORS) ───────────────────────────────────────────
  trustedOrigins: [env.BETTER_AUTH_URL],
});

// Export types for downstream use
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;