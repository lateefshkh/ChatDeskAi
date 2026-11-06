// src/lib/rag/retrieve.ts
import { sql } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { generateEmbedding } from "@/lib/ingestion/embedder";

export interface RetrievedChunk {
  id: string;
  text: string;
  sourceId: string;
  similarity: number;
}

export async function retrieveRelevantChunks(
  tenantId: string,
  query: string,
  limit = 5
): Promise<RetrievedChunk[]> {
  // 1. User ke sawaal ka embedding banayein
  const queryEmbedding = await generateEmbedding(query);

  // 2. Vector search (RLS enforced)
  return await withTenant(tenantId, async (tx) => {
    const result = await tx.execute(sql`
      SELECT 
        id, 
        text, 
        source_id as "sourceId",
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
      FROM chunks
      WHERE tenant_id = ${tenantId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit}
    `);

    // FIX: Proper type casting to satisfy TypeScript
    return result.rows.map((row) => ({
      id: row.id as string,
      text: row.text as string,
      sourceId: row.sourceId as string,
      similarity: row.similarity as number,
    }));
  });
}