// src/lib/auth/require-admin.ts
import { requireAuth } from "./require-auth";
import { AppError } from "@/lib/errors";

export async function requireAdmin() {
  const ctx = await requireAuth();
  
  // Ab hardcoded email ki jagah role check karein
  if (ctx.user.role !== "platform_admin") {
    throw new AppError("FORBIDDEN", 403, "You do not have permission to access this page.");
  }
  
  return ctx;
}