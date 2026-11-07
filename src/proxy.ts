// src/proxy.ts
//
// Purpose: Security headers + CSP on every response.
//
// NOTE: Next.js 16 renamed `middleware.ts` → `proxy.ts`.
//
// IMPORTANT: Proxy is defense-in-depth, NOT the only auth check.
// Every route handler, page, and DAL call re-checks auth/session separately.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // CSP: standard policy with Cloudflare Turnstile & Razorpay domains allowed
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://checkout.razorpay.com https://*.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline' https://checkout.razorpay.com`,
    `img-src 'self' data: https: https://*.razorpay.com`,
    `font-src 'self'`,
    `connect-src 'self' ${process.env.NEXT_PUBLIC_APP_URL || ""} https://challenges.cloudflare.com https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com`,
    `frame-src 'self' https://challenges.cloudflare.com https://api.razorpay.com https://checkout.razorpay.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};