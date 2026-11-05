// src/lib/auth/tenant-creation.ts
//
// Purpose: Create a tenant for a newly signed-up user.
//
// Design:
// - publicId = 22-char base64url random (unguessable, URL-safe).
// - Status starts as 'pending_payment' (Phase 3 activates on payment).
// - Uses admin connection (RLS bypass) — tenant must be created before RLS applies.
// - Atomic: if tenant creation fails, we surface error to caller (they roll back user).
//
// Ye kyun zaroori hai:
// - publicId random hai — attacker tenant enumerate nahi kar sakta.
// - 'pending_payment' status means paid features (chat) blocked until payment.
// - Tenant creation failure must be visible — silent failure = broken workspace.

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tenants, type Tenant } from "@/lib/db/schema";

/**
 * Generate a random, URL-safe publicId (22 chars = 128 bits entropy).
 * Collision probability: 2^-64 after 2^64 tenants (never in practice).
 */
function generatePublicId(): string {
  return randomBytes(16).toString("base64url"); // 22 chars
}

/**
 * Create a tenant for the given owner.
 * Throws if:
 * - Owner already has a tenant (one tenant per owner in v1)
 * - DB insert fails
 */
export async function createTenantForOwner(
  ownerUserId: string,
  ownerEmail: string
): Promise<Tenant> {
  // Check if owner already has a tenant (idempotency guard)
  const existing = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.ownerUserId, ownerUserId))
    .limit(1);

  if (existing[0]) {
    throw new Error("TENANT_ALREADY_EXISTS");
  }

  // Derive a default tenant name from email (e.g., "john" from john@example.com)
  // Owner can rename later in dashboard settings.
  const defaultName = ownerEmail.split("@")[0]?.slice(0, 50) || "My Workspace";

  const publicId = generatePublicId();

  const inserted = await db
    .insert(tenants)
    .values({
      name: defaultName,
      ownerUserId,
      publicId,
      status: "pending_payment",
      planId: null,
      quotaMonthlyChats: 0,
      quotaUsedChats: 0,
    })
    .returning();

  const tenant = inserted[0];
  if (!tenant) {
    throw new Error("TENANT_CREATE_FAILED");
  }

  return tenant;
}