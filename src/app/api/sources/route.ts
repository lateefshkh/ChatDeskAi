// src/app/api/sources/route.ts
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { createSource } from "@/lib/dal/sources";
import { createChunk } from "@/lib/dal/chunks";
import { fetchAndExtractText } from "@/lib/ingestion/fetcher";
import { chunkText } from "@/lib/ingestion/chunker";
import { generateEmbedding } from "@/lib/ingestion/embedder";
import { handleApiError, ValidationError } from "@/lib/errors";
import { updateSourceStatus } from "@/lib/dal/sources";
import { createHash } from "node:crypto";

const bodySchema = z.object({
  type: z.enum(["url", "text"]),
  label: z.string().min(1).max(100),
  content: z.string().min(1).max(50000),
}).strict();

export async function POST(request: Request) {
  try {
    const ctx = await requireAuth();
    const body = await request.json().catch(() => null);

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const { type, label, content } = parsed.data;

    // 1. Create source (queued)
    const source = await createSource({
      tenantId: ctx.tenant.id,
      type,
      label,
    });

    // Note: Yeh processing background mein hona chahiye (Inngest), 
    // lekin abhi ke liye hum sync kar rahe hain taake test kar sakein.
    // (Warning: Long requests timeout ho sakti hain, Phase 8 mein fix karenge)

    try {
      // 2. Update to processing
      await updateSourceStatus({ tenantId: ctx.tenant.id, sourceId: source.id, status: "processing" });

      // 3. Extract text
      let rawText = content;
      if (type === "url") {
        rawText = await fetchAndExtractText(content);
      }

      // 4. Chunk
      const chunks = chunkText(rawText);

      // 5. Save chunks with embeddings
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);
        await createChunk({
          tenantId: ctx.tenant.id,
          sourceId: source.id,
          text: chunk.text,
          embedding,
          embeddingModel: "placeholder",
          embeddingVersion: "v1",
          tokenCount: Math.ceil(chunk.text.length / 4), // rough estimate
          position: chunk.position,
          contentHash: createHash("sha256").update(chunk.text).digest("hex"),
        });
      }

      // 6. Mark ready
      await updateSourceStatus({ tenantId: ctx.tenant.id, sourceId: source.id, status: "ready" });

    } catch (err: any) {
      console.error("[ingestion] Failed:", err);
      await updateSourceStatus({
        tenantId: ctx.tenant.id,
        sourceId: source.id,
        status: "failed",
        error: err.message,
      });
      throw new ValidationError(`Ingestion failed: ${err.message}`);
    }

    return Response.json({ source }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}