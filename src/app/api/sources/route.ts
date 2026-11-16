// src/app/api/sources/route.ts
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { createSource, updateSourceStatus } from "@/lib/dal/sources";
import { createChunk } from "@/lib/dal/chunks";
import { scrapeFullWebsite } from "@/lib/ingestion/playwright-scraper";
import { chunkText } from "@/lib/ingestion/chunker";
import { generateEmbedding } from "@/lib/ingestion/embedder";
import { extractTextFromPdf } from "@/lib/ingestion/parsers/pdf";
import { extractTextFromSheet } from "@/lib/ingestion/parsers/sheet";
import { handleApiError, ValidationError } from "@/lib/errors";
import { createHash } from "node:crypto";

export const maxDuration = 300;

const jsonBodySchema = z.object({
  type: z.enum(["url", "text"]),
  label: z.string().min(1).max(100),
  content: z.string().min(1).max(50000),
  mode: z.enum(["vercel", "local", "custom"]).default("vercel"),
  customPages: z.number().int().min(1).max(1000).optional(),
}).strict();

export async function POST(request: Request) {
  try {
    const ctx = await requireAuth();
    const contentType = request.headers.get("content-type") || "";

    let type: "url" | "text" | "pdf" | "sheet";
    let label: string;
    let content = "";
    let mode: "vercel" | "local" | "custom" = "vercel";
    let customPages = 100;
    let fileBuffer: Buffer | null = null;
    let fileName = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      type = (formData.get("type") as "pdf" | "sheet") || "pdf";
      label = (formData.get("label") as string) || "";
      mode = (formData.get("mode") as any) || "vercel";
      const cp = formData.get("customPages");
      if (cp) customPages = Number(cp);

      const file = formData.get("file") as File | null;
      if (!file) throw new ValidationError("No file uploaded");

      fileName = file.name;
      const isPdf = type === "pdf";
      const isSheet = type === "sheet";

      if (isPdf) {
        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
          throw new ValidationError("Only PDF files are allowed for PDF type");
        }
        if (file.size > 20 * 1024 * 1024) {
          throw new ValidationError("PDF too large (max 20 MB)");
        }
      } else if (isSheet) {
        const validExts = [".xlsx", ".xls", ".csv"];
        if (!validExts.some((ext) => file.name.toLowerCase().endsWith(ext))) {
          throw new ValidationError("Only .xlsx, .xls, .csv allowed for spreadsheet type");
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new ValidationError("Spreadsheet too large (max 10 MB)");
        }
      } else {
        throw new ValidationError(`Unsupported type: ${type}`);
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      if (!label) label = file.name.replace(/\.(pdf|xlsx?|csv)$/i, "");
    } else {
      const body = await request.json().catch(() => null);
      const parsed = jsonBodySchema.safeParse(body);
      if (!parsed.success) throw new ValidationError("Invalid input");

      const data = parsed.data;
      type = data.type;
      label = data.label;
      content = data.content;
      mode = data.mode;
      if (data.customPages) customPages = data.customPages;
    }

    if (!label || label.length > 100) {
      throw new ValidationError("Label required (1-100 chars)");
    }

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
        let maxPages: number;
        let maxDepth: number;

        if (mode === "vercel") {
          maxPages = 5;
          maxDepth = 2;
        } else if (mode === "local") {
          maxPages = 50;
          maxDepth = 3;
        } else {
          maxPages = customPages;
          maxDepth = customPages > 100 ? 4 : 3;
        }

        console.log(`[ingestion] Mode: ${mode}, Max pages: ${maxPages}, Max depth: ${maxDepth}`);
        pages = await scrapeFullWebsite(content, maxPages, maxDepth);
        if (pages.length === 0) {
          throw new Error("No content could be extracted from the website");
        }
      } else if (type === "pdf" && fileBuffer) {
        console.log(`[ingestion] PDF: ${fileName} (${fileBuffer.length} bytes)`);
        const text = await extractTextFromPdf(fileBuffer);
        pages = [{ url: "pdf-upload", text }];
      } else if (type === "sheet" && fileBuffer) {
        console.log(`[ingestion] Sheet: ${fileName} (${fileBuffer.length} bytes)`);
        const text = await extractTextFromSheet(fileBuffer, fileName);
        pages = [{ url: "sheet-upload", text }];
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

      console.log(`[ingestion] ${type} processed: ${pages.length} pages, ${totalChunks} chunks`);
    } catch (err: any) {
      console.error("[ingestion] Failed:", err?.message);
      await updateSourceStatus({
        tenantId: ctx.tenant.id,
        sourceId: source.id,
        status: "failed",
        error: err?.message ?? "Unknown error",
      });
      throw new ValidationError(`Ingestion failed: ${err?.message}`);
    }

    return Response.json({ source }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}