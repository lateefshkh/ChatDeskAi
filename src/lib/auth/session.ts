// src/lib/auth/session.ts
//
// Purpose: Session → tenant resolution.
//
// Flow:
// 1. Request headers se Better Auth session validate karo.
// 2. Session se userId nikalo.
// 3. userId se tenant lookup (admin connection, RLS bypass).
// 4. Return { session, user, tenant } or null.
//
// Ye kyun zaroori hai:
// - Tenant session se derive hota hai, kabhi client input se nahi.
// - Agar attacker session cookie forge kare to Better Auth signature check fail karega.
// - Tenant lookup admin connection se hota hai kyunki user ka tenant resolve karna hai
//   (RLS ke liye pehle tenantId chahiye — chicken-and-egg problem).

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { tenants } from "@/lib/db/schema";

export interface SessionContext {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
    role: string;
  };
  tenant: {
    id: string;
    publicId: string;
    status: string;
    planId: string | null;
  } | null;
}

/**
 * Resolve session → user → tenant.
 *
 * Returns null if:
 * - No session cookie
 * - Session expired
 * - Session invalid (signature mismatch)
 * - User not found (deleted)
 *
 * Returns tenant: null if:
 * - User exists but tenant not created yet (shouldn't happen after signup)
 *
 * NOT for use in:
 * - Public chat routes (/c/[publicId]) — those resolve tenant by publicId
 * - Admin routes — those use separate role check
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  try {
    // Better Auth reads cookie from headers and validates signature
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    // Fetch full user (session.user may be partial)
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const user = userRows[0];
    if (!user) {
      // Session valid but user deleted — treat as no session
      return null;
    }

    // Fetch tenant (may be null if signup incomplete)
    const tenantRows = await db
      .select({
        id: tenants.id,
        publicId: tenants.publicId,
        status: tenants.status,
        planId: tenants.planId,
      })
      .from(tenants)
      .where(eq(tenants.ownerUserId, user.id))
      .limit(1);

    const tenant = tenantRows[0] ?? null;

    return {
      session: {
        id: session.session.id,
        userId: session.session.userId,
        expiresAt: new Date(session.session.expiresAt),
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
      },
      tenant,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[session] resolve failed:", message);
    return null;
  }
}

/**
 * Get only the tenantId from session.
 * Use this for DAL calls — then pass tenantId to withTenant().
 *
 * Throws if no tenant (caller must handle).
 */
export async function requireTenantIdFromSession(): Promise<string> {
  const ctx = await getSessionContext();
  if (!ctx) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!ctx.tenant) {
    throw new Error("NO_TENANT");
  }
  return ctx.tenant.id;
}