// src/lib/auth/session.ts
//
// Purpose: Session → tenant resolution.

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