// src/app/api/auth/[...all]/route.ts
//
// Purpose: Better Auth API route handler.
//
// Better Auth exposes all auth endpoints under /api/auth/*:
// - POST /api/auth/sign-up/email
// - POST /api/auth/sign-in/email
// - POST /api/auth/sign-out
// - POST /api/auth/forget-password
// - POST /api/auth/reset-password
// - GET  /api/auth/verify-email
// - GET  /api/auth/session
//
// Ye kyun zaroori hai:
// - Better Auth ka core routing yahan mount hota hai.
// - Catch-all route [...all] Next.js ke dynamic segments handle karta hai.

import { auth } from "@/lib/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);