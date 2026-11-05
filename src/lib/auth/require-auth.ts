// src/lib/auth/require-auth.ts
//
// Purpose: Route-level auth guard. Every protected route MUST call this.
//
// Design:
// - Throws typed AppError if no session / no tenant / not verified.
// - Returns SessionContext on success.
// - Route handler wraps in try/catch and uses central error handler.
//
// Ye kyun zaroori hai:
// - Proxy (middleware) bypass ho sakta hai (direct fn calls, tests).
// - Server-side auth re-check har request pe zaroori hai.
// - Defense in depth: proxy + route handler + DAL = 3 layers.

import { getSessionContext, type SessionContext } from "@/lib/auth/session";
import { UnauthorizedError, AppError } from "../../lib/errors";

/**
 * Require a valid authenticated session with a tenant.
 * Also requires emailVerified.
 *
 * @returns SessionContext (session + user + tenant, tenant NOT null)
 * @throws UnauthorizedError if any check fails
 */
export async function requireAuth(): Promise<
  SessionContext & { tenant: NonNullable<SessionContext["tenant"]> }
> {
  const ctx = await getSessionContext();

  if (!ctx) {
    throw new UnauthorizedError();
  }

  if (!ctx.user.emailVerified) {
    throw new AppError(
      "EMAIL_NOT_VERIFIED",
      403,
      "Please verify your email before continuing."
    );
  }

  if (!ctx.tenant) {
    throw new AppError(
      "NO_TENANT",
      403,
      "No workspace found. Please complete signup."
    );
  }

  return ctx as SessionContext & { tenant: NonNullable<SessionContext["tenant"]> };
}

/**
 * Require a valid session but allow unverified email.
 * Use for verification-specific routes.
 */
export async function requireSession(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) {
    throw new UnauthorizedError();
  }
  return ctx;
}