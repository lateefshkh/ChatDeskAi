// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [justVerified, setJustVerified] = useState(false);
  const [justReset, setJustReset] = useState(false);
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setLoading(false);
    setError(null);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setJustVerified(params.get("verified") === "1");
      setJustReset(params.get("reset") === "1");
      setJustLoggedOut(params.get("loggedout") === "1");
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        code?: string;
      };

      if (!response.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setError(
            "Your account is pending approval from Headquarter. We have notified the admin. Please check back later."
          );
        } else {
          setError(data.message || "Invalid email or password.");
        }
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8F3EE] border border-[#CDE5DA] text-[#0D4B37] text-xs font-semibold mb-3">
          <span>Account Login</span>
        </div>
        <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-[#71717A] mt-1">
          Sign in to manage your assistant, knowledge base, and customer leads.
        </p>
      </div>

      {/* Notifications */}
      {justVerified && (
        <div className="mb-5 p-3.5 bg-[#E8F3EE] border border-[#CDE5DA] rounded-2xl flex items-center gap-2.5 text-xs text-[#0D4B37]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Email verified! Please log in below.</span>
        </div>
      )}
      {justReset && (
        <div className="mb-5 p-3.5 bg-[#E8F3EE] border border-[#CDE5DA] rounded-2xl flex items-center gap-2.5 text-xs text-[#0D4B37]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Password reset successful. Sign in with your new password.</span>
        </div>
      )}
      {justLoggedOut && (
        <div className="mb-5 p-3.5 bg-[#F4F3EE] border border-[#E4E2DC] rounded-2xl flex items-center gap-2.5 text-xs text-[#71717A]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>You have been safely signed out.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-[#18181B]">
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              autoComplete="off"
              disabled={loading}
              placeholder="alex@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-[#18181B]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#0D4B37] hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={128}
              autoComplete="new-password"
              disabled={loading}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tactile-pill-btn w-full mt-2 py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 pt-6 border-t border-[#F0EFEA] text-center">
        <p className="text-xs text-[#71717A]">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/signup"
            className="text-[#0D4B37] font-bold hover:underline transition-colors"
          >
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}
