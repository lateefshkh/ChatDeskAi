// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      // Token nahi hai (jo normal user ke liye hoga)
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
              "Verification failed. The link may be expired or invalid."
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
        <Link href="/" className="text-xl font-semibold text-neutral-900 block mb-6">
          ChatDesk
        </Link>

        {status === "verifying" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Verifying your email...
            </h1>
            <p className="text-sm text-neutral-500">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Email verified!
            </h1>
            <p className="text-sm text-neutral-500">
              Redirecting to login page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Verification failed
            </h1>
            <p className="text-sm text-neutral-500 mb-4">{errorMessage}</p>
            <Link href="/login" className="text-sm text-neutral-900 font-medium hover:underline">
              Back to login
            </Link>
          </>
        )}

        {status === "missing-token" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Awaiting Verification
            </h1>
            <p className="text-sm text-neutral-500 mb-4">
              Your request has been sent to Headquarter. Once verified, you will be able to log in.
            </p>
            <Link href="/login" className="text-sm text-neutral-900 font-medium hover:underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}