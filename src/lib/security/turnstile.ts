// src/lib/security/turnstile.ts
//
// Purpose: Server-side Cloudflare Turnstile verification.
//
// Flow:
// 1. Client-side Turnstile widget returns a token.
// 2. Server sends token to Cloudflare's siteverify endpoint.
// 3. Cloudflare responds with success: true/false.
// 4. Server accepts/rejects the request.
//
// Ye kyun zaroori hai:
// - Client-side Turnstile bypass ho sakta hai (attacker widget skip kar sakta hai).
// - Server-side verify ke bina bot protection bekar hai.
// - Cloudflare docs: "Never trust client-side success."

import { env } from "@/lib/env";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile token with Cloudflare.
 *
 * @param token — Turnstile token from client
 * @param remoteIp — optional client IP for additional validation
 * @returns { success: boolean, error?: string }
 */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // Input validation
  if (!token || typeof token !== "string" || token.length > 2048) {
    return { success: false, error: "invalid_token" };
  }

  try {
    const formData = new FormData();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    // 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: "verify_api_failed" };
    }

    const data = (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      return {
        success: false,
        error: data["error-codes"]?.[0] || "verification_failed",
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[turnstile] verify exception:", message);
    return { success: false, error: "verify_unavailable" };
  }
}