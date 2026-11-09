// src/app/(auth)/signup/page.tsx
"use client";

import { useState, useCallback, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";

export default function SignupPage() {
  const router = useRouter();
  const [justDeleted, setJustDeleted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setJustDeleted(params.get("deleted") === "1");
    }
  }, []);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setError("Bot verification failed. Please refresh and try again.");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the bot verification.");
      return;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          turnstileToken,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error || data.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/verify-email?email=" + encodeURIComponent(email.trim().toLowerCase()));
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const isPasswordLongEnough = password.length >= 10;
  const doPasswordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E3EDE7] border border-[#C5DCD0] text-[#134235] text-xs font-semibold mb-3">
          <span>10 Free Chats Included - No Credit Card Required</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
          Create your account
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Set up your website assistant in minutes.
        </p>
      </div>

      {/* Account Deleted Success Banner */}
      {justDeleted && (
        <div className="mb-4 p-3 bg-[#E3EDE7] border border-[#C5DCD0] rounded-2xl flex items-center gap-2 text-xs text-[#134235]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your account has been deleted. You can create a fresh account below.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="block text-xs font-semibold text-[#18181B]">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={100}
              autoComplete="name"
              disabled={loading}
              placeholder="John Doe"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Work Email */}
        <div className="space-y-1">
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
              autoComplete="email"
              disabled={loading}
              placeholder="john@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-[#18181B]">
              Password
            </label>
            <span className={`text-[10px] font-medium ${isPasswordLongEnough ? "text-[#0D4B37]" : "text-[#71717A]"}`}>
              Min. 10 chars
            </span>
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
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              disabled={loading}
              placeholder="Create strong password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="confirm" className="block text-xs font-semibold text-[#18181B]">
              Confirm Password
            </label>
            {confirm.length > 0 && (
              <span className={`text-[10px] font-semibold ${doPasswordsMatch ? "text-[#0D4B37]" : "text-red-500"}`}>
                {doPasswordsMatch ? "✓ Passwords match" : "Does not match"}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
              <Shield className="w-4 h-4" />
            </div>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#DDD7CD] rounded-2xl text-xs text-[#111827] placeholder-[#A1A1AA] focus:outline-none focus:border-[#134235] focus:ring-2 focus:ring-[#134235]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Bot Verification */}
        <div className="pt-1">
          <TurnstileWidget
            onVerify={handleTurnstileVerify}
            onError={handleTurnstileError}
            onExpire={handleTurnstileExpire}
            theme="light"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="tactile-pill-btn w-full mt-2 py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 pt-5 border-t border-[#F0EFEA] text-center space-y-2">
        <p className="text-xs text-[#6B7280]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#134235] font-bold hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-[10px] text-[#A1A1AA]">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#52525B]">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-[#52525B]">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
