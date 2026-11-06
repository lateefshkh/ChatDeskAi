// src/app/api/chat/route.ts
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tenants, conversations, messages } from "@/lib/db/schema";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { buildRagPrompt } from "@/lib/rag/prompt";
import { generateAnswer } from "@/lib/rag/generate";
import { handleApiError, ValidationError, AppError } from "@/lib/errors";
import { incrementMessageCount } from "@/lib/dal/conversations";
import { checkChatLimit } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/ip-hash";

const bodySchema = z.object({
  publicId: z.string().min(1),
  message: z.string().min(1).max(1000),
  conversationId: z.string().uuid().nullable().optional(),
}).strict();

export async function POST(request: Request) {
  try {
    // ─── RATE LIMIT CHECK ─────────────────────────────────────────────
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const ipHash = hashIp(ip);
    const rateLimitResult = await checkChatLimit(ipHash);
    if (!rateLimitResult.success) {
      throw new AppError(
        "RATE_LIMITED",
        429,
        "Too many messages. Please wait a moment and try again."
      );
    }

    // ─── INPUT VALIDATION ─────────────────────────────────────────────
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input");
    }

    const { publicId, message, conversationId } = parsed.data;

    // ─── TENANT LOOKUP ────────────────────────────────────────────────
    const tenantRows = await db
      .select()
      .from(tenants)
      .where(eq(tenants.publicId, publicId))
      .limit(1);

    const tenant = tenantRows[0];
    if (!tenant) throw new ValidationError("Workspace not found");
    if (tenant.status !== "active") {
      throw new ValidationError("Workspace is not active. Please contact the owner.");
    }

    // ─── QUOTA CHECK ──────────────────────────────────────────────────
    if (tenant.quotaUsedChats >= tenant.quotaMonthlyChats) {
      throw new AppError(
        "QUOTA_EXCEEDED",
        429,
        "This workspace has reached its chat limit. Please contact the owner."
      );
    }

    // ─── CONVERSATION GET/CREATE ──────────────────────────────────────
    let convId = conversationId;
    if (!convId) {
      const newConv = await db.insert(conversations).values({
        tenantId: tenant.id,
        visitorId: `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      }).returning();
      convId = newConv[0].id;
    }

    // ─── SAVE USER MESSAGE ────────────────────────────────────────────
    await db.insert(messages).values({
      tenantId: tenant.id,
      conversationId: convId,
      role: "user",
      content: message,
    });
    await incrementMessageCount(tenant.id, convId);

    // ─── RAG RETRIEVE + GENERATE ──────────────────────────────────────
    const chunks = await retrieveRelevantChunks(tenant.id, message, 5);
    const prompt = buildRagPrompt(message, chunks);
    const { answer, unanswered } = await generateAnswer(prompt);

    // ─── SAVE ASSISTANT MESSAGE ───────────────────────────────────────
    await db.insert(messages).values({
      tenantId: tenant.id,
      conversationId: convId,
      role: "assistant",
      content: answer,
      flags: { unanswered },
    });
    await incrementMessageCount(tenant.id, convId);

    // ─── INCREMENT QUOTA USED ─────────────────────────────────────────
    await db.update(tenants)
      .set({ quotaUsedChats: sql`${tenants.quotaUsedChats} + 1` })
      .where(eq(tenants.id, tenant.id));

    return Response.json({
      conversationId: convId,
      answer,
      unanswered,
    });
  } catch (error) {
    return handleApiError(error);
  }
}