// src/test/dal/chunks.isolation.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { createSource } from "@/lib/dal/sources";
import {
  createChunk,
  listChunksBySource,
  countChunks,
  deleteChunksBySource,
} from "@/lib/dal/chunks";
import { tenants } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { closeAdminPool } from "@/lib/db/with-tenant";

const adminPool = new Pool({ connectionString: env.DATABASE_ADMIN_URL });
const adminDb = drizzle({ client: adminPool });

const tenantAId = randomUUID();
const tenantBId = randomUUID();
let sourceAId: string;
let sourceBId: string;

describe("Chunks DAL - Tenant Isolation", () => {
  beforeAll(async () => {
    await adminDb.insert(tenants).values([
      {
        id: tenantAId,
        name: "Chunk Tenant A",
        ownerUserId: "chunk-owner-a",
        publicId: `chunk-pub-a-${randomUUID()}`,
        status: "active",
      },
      {
        id: tenantBId,
        name: "Chunk Tenant B",
        ownerUserId: "chunk-owner-b",
        publicId: `chunk-pub-b-${randomUUID()}`,
        status: "active",
      },
    ]);

    const srcA = await createSource({
      tenantId: tenantAId,
      type: "text",
      label: "Chunk Source A",
    });
    sourceAId = srcA.id;

    const srcB = await createSource({
      tenantId: tenantBId,
      type: "text",
      label: "Chunk Source B",
    });
    sourceBId = srcB.id;

    // Create chunks for both
    await createChunk({
      tenantId: tenantAId,
      sourceId: sourceAId,
      text: "Chunk A content",
      embedding: null,
      embeddingModel: "test",
      embeddingVersion: "v1",
      tokenCount: 10,
      position: 0,
      contentHash: "hash-a",
    });
    await createChunk({
      tenantId: tenantBId,
      sourceId: sourceBId,
      text: "Chunk B content",
      embedding: null,
      embeddingModel: "test",
      embeddingVersion: "v1",
      tokenCount: 10,
      position: 0,
      contentHash: "hash-b",
    });
  });

  afterAll(async () => {
    await adminDb.delete(tenants).where(eq(tenants.id, tenantAId));
    await adminDb.delete(tenants).where(eq(tenants.id, tenantBId));
    await adminPool.end();
    await closeAdminPool();
  });

  it("listChunksBySource: A sees only its own source chunks", async () => {
    const chunks = await listChunksBySource(tenantAId, sourceAId);
    expect(chunks.length).toBe(1);
    expect(chunks[0]?.text).toBe("Chunk A content");
  });

  it("listChunksBySource: A cannot see B's chunks", async () => {
    const chunks = await listChunksBySource(tenantAId, sourceBId);
    expect(chunks.length).toBe(0);
  });

  it("countChunks: A counts only its own", async () => {
    const count = await countChunks(tenantAId);
    expect(count).toBe(1);
  });

  it("deleteChunksBySource: A cannot delete B's chunks", async () => {
    const deleted = await deleteChunksBySource(tenantAId, sourceBId);
    expect(deleted).toBe(0);

    // Verify B's chunks still exist
    const bChunks = await listChunksBySource(tenantBId, sourceBId);
    expect(bChunks.length).toBe(1);
  });
});
