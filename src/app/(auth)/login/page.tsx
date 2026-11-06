// src/app/(auth)/login/page.tsx
"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";
  const justReset = searchParams.get("reset") === "1";
  const justLoggedOut = searchParams.get("loggedout") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // BFCache FIX: Jab user back/forward button dabaye ya logout karke aaye,
  // to form ko clear kar do aur loading state reset kar do.
  useEffect(() => {
    setEmail("");
    setPassword("");
    setLoading(false);
    setError(null);
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
          setError("Please verify your email before logging in. Check your inbox.");
        } else {
          setError(data.message || "Invalid email or password.");
        }
        setLoading(false);
        return;
      }

      // Success — dashboard pe redirect
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-500">
          Sign in to continue to your dashboard.
        </p>
      </div>

      {/* Messages */}
      {justVerified && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700">
            ✓ Email verified! Please log in to continue.
          </p>
        </div>
      )}
      {justReset && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700">
            ✓ Password reset successful. Please log in.
          </p>
        </div>
      )}
      {justLoggedOut && (
        <div className="mb-6 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-sm text-neutral-700">
            You have been signed out.
          </p>
        </div>
      )}

      {/* autoComplete="off" add kiya taake browser inputs autofill na kare */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            autoComplete="off"
            disabled={loading}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={128}
            autoComplete="new-password"
            disabled={loading}
            placeholder="••••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-neutral-500 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}