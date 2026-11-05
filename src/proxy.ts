// src/proxy.ts
//
// Purpose: Security headers + CSP nonce on every response.
//
// NOTE: Next.js 16 renamed `middleware.ts` → `proxy.ts`.
// The function name also changes from `middleware` to `proxy`.
//
// IMPORTANT: Proxy is defense-in-depth, NOT the only auth check.
// Every route handler, page, and DAL call re-checks auth/session separately.
//
// Ye kyun zaroori hai:
// - CSP bina nonce ke XSS attacks block nahi karta.
// - HSTS MITM downgrade attacks rokta hai.
// - Proxy bypass ho sakta hai (direct fn calls in tests), isliye route-level auth re-check zaroori.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV === "development";

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  response.headers.set("x-nonce", nonce);

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self' ${process.env.NEXT_PUBLIC_APP_URL || ""} https://challenges.cloudflare.com`,
    `frame-src 'self' https://challenges.cloudflare.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};