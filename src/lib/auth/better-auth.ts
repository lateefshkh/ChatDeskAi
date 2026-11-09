// src/lib/auth/better-auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, like } from "drizzle-orm";
import { waitUntil } from "@vercel/functions";
import { db } from "@/lib/db/client";
import { verifications } from "@/lib/db/auth-schema";
import { env, publicEnv } from "@/lib/env";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/resend";

const isProd = env.NODE_ENV === "production";
const ADMIN_EMAIL = "slatif200426@gmail.com"; // <-- APNA EMAIL YAHAN DAALEIN

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: false,

    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
      const sent = await sendPasswordResetEmail(user.email, resetUrl);
      console.log("[RESET] Email sent:", sent, "to:", user.email);
    },

    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,

    onPasswordReset: async ({ user }) => {
      await db
        .delete(verifications)
        .where(
          and(
            like(verifications.identifier, "reset-password:%"),
            eq(verifications.value, user.id),
          ),
        );
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
      
      const sent = await sendVerificationEmail(ADMIN_EMAIL, verifyUrl, user.email);
      console.log("[VERIFY] Admin email sent:", sent, "for user:", user.email);
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/request-password-reset": { window: 300, max: 3 },
      "/sign-in/email": { window: 60, max: 5 },
      "/send-verification-email": { window: 300, max: 3 },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    cookiePrefix: "chatdesk",
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    },
    backgroundTasks: {
      handler: (promise) => {
        const safe = promise.catch((err) =>
          console.error("[background-task] FAILED:", err),
        );
        if (isProd) waitUntil(safe);
        else void safe;
      },
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  trustedOrigins: [env.BETTER_AUTH_URL],
});

export type Auth = typeof auth;
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;