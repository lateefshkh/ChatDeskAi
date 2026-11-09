// src/app/api/auth/signup/route.ts
//
// Purpose: Custom signup endpoint - creates user + tenant atomically.
//
// Flow:
// 1. Validate input (email, password, name).
// 2. Verify Turnstile token.
// 3. Check rate limit (per-IP).
// 4. Call Better Auth signup (creates user).
// 5. Create tenant for the user.
// 6. Manually trigger verification email.
// 7. Return success.

import { z } from "zod";
import { auth } from "@/lib/auth/better-auth";
import { createTenantForOwner } from "@/lib/auth/tenant-creation";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { checkSignupLimit } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/ip-hash";
import { handleApiError, AppError, ValidationError, RateLimitError } from "@/lib/errors";

// ─── Input schema ─────────────────────────────────────────────────────────
const signupSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  password: z.string().min(10).max(128),
  name: z.string().min(1).max(100).trim(),
  turnstileToken: z.string().min(1).max(2048),
}).strict();

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Parse and validate body
    const body = await request.json().catch(() => null);
    if (!body) {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input. Check your email, password, and name.");
    }

    const { email, password, name, turnstileToken } = parsed.data;

    // 2. Get client IP
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    // 3. Rate limit check
    const limitResult = await checkSignupLimit(ip);
    if (!limitResult.success) {
      const retryAfter = Math.ceil((limitResult.reset - Date.now()) / 1000);
      throw new RateLimitError(retryAfter > 0 ? retryAfter : 60);
    }

    // 4. Turnstile verify
    const turnstileResult = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileResult.success) {
      throw new ValidationError(
        "Bot verification failed. Please refresh the page and try again."
      );
    }

    // 5. Create user via Better Auth
    let signupResult;
    try {
      signupResult = await auth.api.signUpEmail({
        body: { email, password, name },
        headers: request.headers,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("already") || message.includes("exists")) {
        console.warn("[signup] duplicate email attempt:", hashIp(ip));
        return Response.json(
          { message: "If this email is new, check your inbox for a verification link." },
          { status: 200 }
        );
      }
      throw err;
    }

    if (!signupResult?.user?.id) {
      throw new AppError("SIGNUP_FAILED", 500, "Signup failed. Please try again.");
    }

    // 6. Create tenant
    try {
      await createTenantForOwner(signupResult.user.id, email);
    } catch (err) {
      console.error("[signup] tenant creation failed:", err);
      throw new AppError("TENANT_FAILED", 500, "Workspace setup failed. Please contact support.");
    }

    // 7. Audit log
    console.info("[signup] success:", {
      userId: signupResult.user.id,
      ipHash: hashIp(ip),
      ts: new Date().toISOString(),
    });

    // 8. MANUAL VERIFICATION EMAIL TRIGGER (YEH NAYA HAI)
    try {
      await auth.api.sendVerificationEmail({
        body: {
          email: signupResult.user.email,
          callbackURL: "/login?verified=1",
        },
      });
      console.log("[signup] Manual verification email triggered for:", signupResult.user.email);
    } catch (err) {
      console.error("[signup] Failed to send verification email:", err);
    }

    // 9. Return success
    return Response.json(
      { message: "Account created. Check your inbox to verify your email before logging in." },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}