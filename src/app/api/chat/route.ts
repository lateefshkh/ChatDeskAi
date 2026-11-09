// src/app/api/chat/route.ts
import { z } from "zod";
import { eq, sql, and, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tenants, conversations, messages, sources as sourcesTable } from "@/lib/db/schema";
import { users } from "@/lib/db/auth-schema";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { buildRagPrompt } from "@/lib/rag/prompt";
import { handleApiError, ValidationError, AppError } from "@/lib/errors";
import { incrementMessageCount } from "@/lib/dal/conversations";
import { checkChatLimit } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/ip-hash";
import { env } from "@/lib/env";

const bodySchema = z.object({
  publicId: z.string().min(1),
  message: z.string().min(1).max(1000),
  conversationId: z.string().uuid().nullable().optional(),
}).strict();

const ADMIN_EMAILS = ["slatif200426@gmail.com"];

export async function POST(request: Request) {
  try {
    // 1. Rate Limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);
    const rateLimitResult = await checkChatLimit(ipHash);
    if (!rateLimitResult.success) {
      throw new AppError("RATE_LIMITED", 429, "Too many messages. Please wait.");
    }

    // 2. Input Validation
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const { publicId, message, conversationId } = parsed.data;

    // 3. Tenant & Quota Check
    const tenantRows = await db.select().from(tenants).where(eq(tenants.publicId, publicId)).limit(1);
    const tenant = tenantRows[0];
    if (!tenant) throw new ValidationError("Workspace not found");
    if (tenant.status !== "active") throw new ValidationError("Workspace is not active");

    const ownerRows = await db.select({ email: users.email }).from(users).where(eq(users.id, tenant.ownerUserId)).limit(1);
    const ownerEmail = ownerRows[0]?.email?.toLowerCase() || "";
    const isAdmin = ADMIN_EMAILS.includes(ownerEmail);

    if (!isAdmin && tenant.quotaUsedChats >= tenant.quotaMonthlyChats) {
      throw new AppError("QUOTA_EXCEEDED", 429, "Chat limit reached. Please contact the owner.");
    }

    // 4. Conversation Get/Create
    let convId = conversationId;
    if (!convId) {
      const newConv = await db.insert(conversations).values({
        tenantId: tenant.id,
        visitorId: `visitor_${Date.now()}`,
      }).returning();
      convId = newConv[0].id;
    }

    // 4a. FETCH PREVIOUS MESSAGES (Conversation History)
    const previousMessages = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(and(eq(messages.conversationId, convId), eq(messages.tenantId, tenant.id)))
      .orderBy(desc(messages.createdAt))
      .limit(6);

    const history = previousMessages.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 5. Save User Message
    await db.insert(messages).values({ tenantId: tenant.id, conversationId: convId, role: "user", content: message });
    await incrementMessageCount(tenant.id, convId);

    // 5a. META-QUESTION DETECTION
    const lowerMsg = message.toLowerCase();
    const isMetaQuestion = 
      lowerMsg.includes("how many sources") ||
      lowerMsg.includes("what sources") ||
      lowerMsg.includes("what do you know") ||
      lowerMsg.includes("knowledge base") ||
      lowerMsg.includes("what documents");

    if (isMetaQuestion) {
      const sourcesList = await db
        .select({ label: sourcesTable.label, type: sourcesTable.type })
        .from(sourcesTable)
        .where(eq(sourcesTable.tenantId, tenant.id));

      let metaAnswer = "";
      if (sourcesList.length === 0) {
        metaAnswer = "I don't have any knowledge sources added yet. The business owner can add websites, PDFs, or text from their dashboard.";
      } else {
        const sourceNames = sourcesList.map((s) => `• ${s.label} (${s.type})`).join("\n");
        metaAnswer = `I currently have ${sourcesList.length} knowledge source(s) in my database:\n\n${sourceNames}\n\nIf you have a question about any of these, feel free to ask!`;
      }

      await db.insert(messages).values({ tenantId: tenant.id, conversationId: convId, role: "assistant", content: metaAnswer });
      await incrementMessageCount(tenant.id, convId);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: convId })}\n\n`));
          const words = metaAnswer.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word + " " })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        },
      });

      return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
    }

    // 6. Retrieve Context
    const chunks = await retrieveRelevantChunks(tenant.id, message, 5);
    const prompt = buildRagPrompt(message, chunks);

    // 7. Groq Streaming API Call
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are a helpful AI assistant. Answer ONLY from the provided reference data. Do NOT use outside knowledge. If you don't know the answer, politely say so." },
          ...history,
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!groqResponse.ok) throw new Error("Groq API error");

    // 8. Stream Response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAnswer = "";

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: convId })}\n\n`));

        const reader = groqResponse.body?.getReader();
        if (!reader) { controller.close(); return; }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content || "";
                  if (content) {
                    fullAnswer += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {}
              }
            }
          }

          // ✅ 9. SMART UNANSWERED DETECTION
          const lowerAnswer = fullAnswer.toLowerCase();
          const hasDeclinePhrase = 
            lowerAnswer.includes("don't have information") || 
            lowerAnswer.includes("not in my knowledge base") ||
            lowerAnswer.includes("share your contact details");
          
          // Agar jawab chhota hai AUR decline phrase hai, tabhi unanswered maanein
          // (Lamba data/tables wale jawab ko unanswered nahi maanenge)
          const unanswered = hasDeclinePhrase && fullAnswer.length < 300;
          
          await db.insert(messages).values({
            tenantId: tenant.id, conversationId: convId, role: "assistant", content: fullAnswer, flags: { unanswered },
          });
          await incrementMessageCount(tenant.id, convId);
          
          if (!unanswered && !isAdmin) {
            await db.update(tenants).set({ quotaUsedChats: sql`${tenants.quotaUsedChats} + 1` }).where(eq(tenants.id, tenant.id));
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}