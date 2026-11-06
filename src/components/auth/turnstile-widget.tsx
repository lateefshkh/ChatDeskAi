// src/components/auth/turnstile-widget.tsx
//
// Purpose: Cloudflare Turnstile widget (client-side).
//
// Flow:
// 1. Loads Cloudflare's script dynamically.
// 2. Renders the widget.
// 3. On success, calls `onVerify(token)` - parent passes token to server.
// 4. On expiry/error, calls `onError()` - parent resets form.
//
// Ye kyun zaroori hai:
// - Client-side Turnstile se token milta hai, jo server pe verify hota hai.
// - Widget render karna Cloudflare ke script ke bina possible nahi.
// - Token 5 min mein expire ho jata hai - handle karna zaroori.
//
// IMPORTANT: This is a "use client" component. It MUST NOT import @/lib/env
// because env.ts is server-only (validates server secrets which don't exist in browser).
// NEXT_PUBLIC_* vars are inlined at build time by Next.js - safe to use directly.

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Direct access to NEXT_PUBLIC_ var - inlined at build time.
// Safe in client components. No env.ts import needed.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  theme = "light",
  size = "normal",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      return;
    }

    if (!TURNSTILE_SITE_KEY) {
      // Missing config - fail loudly during development.
      // In production, this should be caught at build/boot time.
      console.error("[turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing");
      onError?.();
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: onVerify,
      "error-callback": () => onError?.(),
      "expired-callback": () => onExpire?.(),
      theme,
      size,
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, onVerify, onError, onExpire, theme, size]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="my-4" />
    </>
  );
}