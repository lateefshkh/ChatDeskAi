// src/lib/rag/prompt.ts

export function buildRagPrompt(userQuery: string, chunks: { text: string }[]): string {
  const context = chunks
    .map((c, i) => `[Reference ${i + 1}]\n${c.text}`)
    .join("\n\n");

  return `You are a helpful AI assistant for a business. Your ONLY job is to answer questions using the provided reference data below.

CRITICAL RULES:
1. Answer ONLY based on the reference data provided below. Do NOT use any outside knowledge.
2. If the user asks about a specific company/website (e.g., "vegamovies", "apple", "lateef"), you must ONLY use the reference data that mentions that specific name. Do NOT mix data from different references.
3. If the reference data does not contain the answer, say: "I'm sorry, but I don't have information about that in my knowledge base. Would you like me to connect you with the owner?"
4. If the user asks a follow-up question (like "not this one" or "so tell me about them"), use the previous conversation context but STILL only use the reference data.
5. Do NOT make up products, courses, or services that are not in the reference data.
6. Format answers using markdown tables and bold text for readability.

UNTRUSTED REFERENCE DATA:
---
${context}
---

USER MESSAGE:
${userQuery}

RESPONSE:`;
}