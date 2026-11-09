// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, CheckCircle2, AlertCircle, Clock, Loader2, ArrowRight } from "lucide-react";

type Status = "verifying" | "success" | "error" | "missing-token";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      token = params.get("token");
    }

    if (!token) {
      setStatus("missing-token");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setTimeout(() => {
            router.push("/login?verified=1");
            router.refresh();
          }, 1500);
        } else {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          setErrorMessage(
            data.message ||
              "Verification link is expired or invalid. Please request a new link."
          );
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMessage("Network error. Please try again.");
        setStatus("error");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex items-center justify-center p-6 text-[#18181B] relative overflow-hidden">
      {/* Soft Ambient Background Lighting */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.04] shadow-[0_20px_45px_-12px_rgba(0,0,0,0.06)] text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#0D4B37] flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-[#18181B] tracking-tight">ChatDesk AI</span>
        </Link>

        {status === "verifying" && (
          <div className="space-y-3 py-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F3EE] text-[#0D4B37] flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#18181B]">
              Verifying your email...
            </h1>
            <p className="text-xs text-[#71717A]">
              Confirming your security credentials. Please hold on.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3 py-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F3EE] text-[#0D4B37] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#18181B]">
              Email Verified Successfully
            </h1>
            <p className="text-xs text-[#71717A]">
              Redirecting you to the sign-in portal...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#18181B]">
              Verification Failed
            </h1>
            <p className="text-xs text-[#71717A] max-w-xs mx-auto">{errorMessage}</p>
            <Link
              href="/login"
              className="tactile-pill-btn inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {status === "missing-token" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#18181B]">
              Awaiting Verification
            </h1>
            <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
              Your account registration is received. Once approved by headquarters, your workspace will be ready for login.
            </p>
            <Link
              href="/login"
              className="tactile-pill-btn inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
