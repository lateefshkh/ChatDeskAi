// src/app/(auth)/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left: Branding panel (Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-neutral-950 text-white relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #6366f1 0%, #8b5cf6 40%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-neutral-950 font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold">ChatDesk</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight mb-4">
            Turn your website into a 24/7 AI assistant.
          </h2>
          <p className="text-neutral-400 text-base leading-relaxed mb-8">
            Add your knowledge. Get a chat link. Let AI answer your visitors —
            grounded only in your data.
          </p>
          <ul className="space-y-3 text-sm text-neutral-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Upload URLs, PDFs, or paste text</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Answers only from your content — no hallucinations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Capture leads with name and phone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Multi-tenant isolation — your data stays yours</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-xs text-neutral-500">
          © 2026 ChatDesk. All rights reserved.
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex flex-col bg-white flex-1">
        <div className="lg:hidden p-6 border-b border-neutral-200">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-neutral-900">ChatDesk</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}