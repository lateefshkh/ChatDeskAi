// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token"));
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or expired reset link. Please request a new link.");
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        router.push("/login?reset=1");
      } else {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setError(data.message || "Reset failed. The link may have expired.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isPasswordLongEnough = password.length >= 10;
  const doPasswordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;

  return (
    <div>
      <div className="mb-7">
        <Link
          href="/login"
          className="text-xs font-semibold text-[#0D4B37] hover:underline mb-3 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">
          Set new password
        </h1>
        <p className="text-xs text-[#71717A] mt-1">
          Create a strong password with at least 10 characters.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-[#18181B]">
              New Password
            </label>
            <span className={`text-[10px] ${isPasswordLongEnough ? "text-[#0D4B37] font-semibold" : "text-[#71717A]"}`}>
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
              disabled={loading}
              placeholder="Enter new password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="confirm" className="block text-xs font-semibold text-[#18181B]">
              Confirm Password
            </label>
            {confirm.length > 0 && (
              <span className={`text-[10px] font-semibold ${doPasswordsMatch ? "text-[#0D4B37]" : "text-red-600"}`}>
                {doPasswordsMatch ? "✓ Passwords match" : "Does not match"}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1A1AA]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
              placeholder="Re-enter new password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="tactile-pill-btn w-full mt-2 py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Save & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
