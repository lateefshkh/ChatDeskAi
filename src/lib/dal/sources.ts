// src/lib/dal/sources.ts
//
// Purpose: Data access layer for sources (knowledge base inputs).
//
// Design:
// - Every function takes tenantId as first argument (RLS enforced via withTenant).
// - No direct db access — always goes through withTenant().
// - Returns null/empty array if not found (never throws for "not found").
// - Throws typed errors for actual failures.
//
// Ye kyun zaroori hai:
// - RLS + withTenant = double protection. Application bug ho bhi jaye to DB block karega.
// - tenantId argument mandatory hai — koi function bina tenantId ke query nahi kar sakta.
// - Har function ka isolation test hoga.

import { eq, and, desc, asc, sql } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { sources, type Source, type NewSource } from "@/lib/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────

export type SourceType = "url" | "pdf" | "sheet" | "text";
export type SourceStatus = "queued" | "processing" | "ready" | "failed";

export interface CreateSourceInput {
  tenantId: string;
  type: SourceType;
  label: string;
  contentHash?: string;
}

export interface UpdateSourceStatusInput {
  tenantId: string;
  sourceId: string;
  status: SourceStatus;
  error?: string | null;
}

// ─── Create ───────────────────────────────────────────────────────────────

/**
 * Create a new source for a tenant.
 * Status starts as 'queued'.
 */
export async function createSource(input: CreateSourceInput): Promise<Source> {
  const { tenantId, type, label, contentHash } = input;

  return await withTenant(tenantId, async (tx) => {
    const inserted = await tx
      .insert(sources)
      .values({
        tenantId,
        type,
        label,
        status: "queued",
        contentHash: contentHash ?? null,
      })
      .returning();

    const source = inserted[0];
    if (!source) {
      throw new Error("SOURCE_CREATE_FAILED");
    }
    return source;
  });
}

// ─── Read ─────────────────────────────────────────────────────────────────

/**
 * List all sources for a tenant, newest first.
 */
export async function listSources(tenantId: string): Promise<Source[]> {
  return await withTenant(tenantId, async (tx) => {
    return await tx
      .select()
      .from(sources)
      .where(eq(sources.tenantId, tenantId))
      .orderBy(desc(sources.createdAt));
  });
}

/**
 * Get a single source by id — tenant-scoped.
 * Returns null if not found OR if it belongs to another tenant (RLS hides it).
 */
export async function getSourceById(
  tenantId: string,
  sourceId: string
): Promise<Source | null> {
  return await withTenant(tenantId, async (tx) => {
    const rows = await tx
      .select()
      .from(sources)
      .where(and(eq(sources.id, sourceId), eq(sources.tenantId, tenantId)))
      .limit(1);
    return rows[0] ?? null;
  });
}

/**
 * Count sources for a tenant (for dashboard stats).
 */
export async function countSources(tenantId: string): Promise<number> {
  return await withTenant(tenantId, async (tx) => {
    const result = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(sources)
      .where(eq(sources.tenantId, tenantId));
    return result[0]?.count ?? 0;
  });
}

// ─── Update ───────────────────────────────────────────────────────────────

/**
 * Update source status (called by ingestion jobs).
 * Returns null if source not found or belongs to another tenant.
 */
export async function updateSourceStatus(
  input: UpdateSourceStatusInput
): Promise<Source | null> {
  const { tenantId, sourceId, status, error } = input;

  return await withTenant(tenantId, async (tx) => {
    const updated = await tx
      .update(sources)
      .set({
        status,
        error: error ?? null,
        lastScannedAt: status === "ready" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(sources.id, sourceId), eq(sources.tenantId, tenantId)))
      .returning();
    return updated[0] ?? null;
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────

/**
 * Delete a source (and cascade-deletes its chunks).
 * Returns true if deleted, false if not found.
 */
export async function deleteSource(
  tenantId: string,
  sourceId: string
): Promise<boolean> {
  return await withTenant(tenantId, async (tx) => {
    const deleted = await tx
      .delete(sources)
      .where(and(eq(sources.id, sourceId), eq(sources.tenantId, tenantId)))
      .returning({ id: sources.id });
    return deleted.length > 0;
  });
}