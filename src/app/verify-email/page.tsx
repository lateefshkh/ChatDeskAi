// src/app/verify-email/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "verifying" | "success" | "error" | "missing-token";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("missing-token");
      return;
    }

    // Better Auth v1.7: GET endpoint with query params
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          // FIX: 1.5 seconds baad direct login page pe redirect
          // User ko success dikhne ka time milega, phir auto-redirect
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
  }, [token, router]);

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
            {/* Button hata diya hai — auto redirect hoga */}
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
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">Invalid link</h1>
            <p className="text-sm text-neutral-500 mb-4">
              This link is missing a verification token. Please check your email and click the correct link.
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}