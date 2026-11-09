// src/app/api/sources/route.ts
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { createSource, updateSourceStatus } from "@/lib/dal/sources";
import { createChunk } from "@/lib/dal/chunks";
import { scrapeFullWebsite } from "@/lib/ingestion/playwright-scraper";
import { chunkText } from "@/lib/ingestion/chunker";
import { generateEmbedding } from "@/lib/ingestion/embedder";
import { handleApiError, ValidationError } from "@/lib/errors";
import { createHash } from "node:crypto";

// ✅ Vercel timeout badhaya (Hobby plan max 60s)
export const maxDuration = 60;

const bodySchema = z.object({
  type: z.enum(["url", "text"]),
  label: z.string().min(1).max(100),
  content: z.string().min(1).max(50000),
  mode: z.enum(["vercel", "local"]).default("vercel"), // <-- NAYA
}).strict();

export async function POST(request: Request) {
  try {
    const ctx = await requireAuth();
    const body = await request.json().catch(() => null);

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const { type, label, content, mode } = parsed.data;

    const source = await createSource({
      tenantId: ctx.tenant.id,
      type,
      label,
    });

    try {
      await updateSourceStatus({
        tenantId: ctx.tenant.id,
        sourceId: source.id,
        status: "processing",
      });

      let pages: { url: string; text: string }[] = [];

      if (type === "url") {
        // ✅ Mode ke hisaab se maxPages decide karein
        const maxPages = mode === "local" ? 50 : 5;
        console.log(`[ingestion] Mode: ${mode}, Max pages: ${maxPages}`);
        
        pages = await scrapeFullWebsite(content, maxPages);
        if (pages.length === 0) {
          throw new Error("No content could be extracted from the website");
        }
      } else {
        pages = [{ url: "text-input", text: content }];
      }

      let totalChunks = 0;
      for (const page of pages) {
        const chunks = chunkText(page.text);
        for (const chunk of chunks) {
          const embedding = await generateEmbedding(chunk.text);
          await createChunk({
            tenantId: ctx.tenant.id,
            sourceId: source.id,
            text: chunk.text,
            embedding,
            embeddingModel: "Xenova/all-MiniLM-L6-v2",
            embeddingVersion: "v1",
            tokenCount: Math.ceil(chunk.text.length / 4),
            position: chunk.position,
            contentHash: createHash("sha256").update(chunk.text).digest("hex"),
          });
          totalChunks++;
        }
      }

      await updateSourceStatus({
        tenantId: ctx.tenant.id,
        sourceId: source.id,
        status: "ready",
      });

      console.log(`[ingestion] Scraped ${pages.length} pages, created ${totalChunks} chunks`);
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