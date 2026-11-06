// src/lib/dal/chunks.ts
//
// Purpose: DAL for chunks (text segments + embeddings).
//
// Ye kyun zaroori hai:
// - Chunks are the RAG retrieval unit.
// - Vector search will query this table (Phase 5).
// - Tenant isolation must be rock-solid.

import { eq, and, sql } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { chunks, type Chunk } from "@/lib/db/schema";

export interface CreateChunkInput {
  tenantId: string;
  sourceId: string;
  text: string;
  embedding: number[] | null;
  embeddingModel: string;
  embeddingVersion: string;
  tokenCount: number;
  position: number;
  contentHash: string;
}

// ─── Create ───────────────────────────────────────────────────────────────

/**
 * Create a chunk. Used by ingestion jobs.
 * Embedding is optional (can be null if embedding provider fails).
 */
export async function createChunk(input: CreateChunkInput): Promise<Chunk> {
  const {
    tenantId,
    sourceId,
    text,
    embedding,
    embeddingModel,
    embeddingVersion,
    tokenCount,
    position,
    contentHash,
  } = input;

  return await withTenant(tenantId, async (tx) => {
    const inserted = await tx
      .insert(chunks)
      .values({
        tenantId,
        sourceId,
        text,
        embedding,
        embeddingModel,
        embeddingVersion,
        tokenCount,
        position,
        contentHash,
      })
      .returning();
    const chunk = inserted[0];
    if (!chunk) {
      throw new Error("CHUNK_CREATE_FAILED");
    }
    return chunk;
  });
}

// ─── Read ─────────────────────────────────────────────────────────────────

/**
 * List all chunks for a source (used for debug/admin views).
 */
export async function listChunksBySource(
  tenantId: string,
  sourceId: string
): Promise<Chunk[]> {
  return await withTenant(tenantId, async (tx) => {
    return await tx
      .select()
      .from(chunks)
      .where(and(eq(chunks.tenantId, tenantId), eq(chunks.sourceId, sourceId)))
      .orderBy(chunks.position);
  });
}

/**
 * Count chunks for a tenant (dashboard stats + quota).
 */
export async function countChunks(tenantId: string): Promise<number> {
  return await withTenant(tenantId, async (tx) => {
    const result = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(chunks)
      .where(eq(chunks.tenantId, tenantId));
    return result[0]?.count ?? 0;
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────

/**
 * Delete all chunks for a source (called when source is re-scanned).
 * Returns count of deleted rows.
 */
export async function deleteChunksBySource(
  tenantId: string,
  sourceId: string
): Promise<number> {
  return await withTenant(tenantId, async (tx) => {
    const deleted = await tx
      .delete(chunks)
      .where(and(eq(chunks.tenantId, tenantId), eq(chunks.sourceId, sourceId)))
      .returning({ id: chunks.id });
    return deleted.length;
  });
}