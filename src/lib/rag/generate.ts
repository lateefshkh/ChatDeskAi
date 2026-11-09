// src/lib/rag/generate.ts
import { env } from "@/lib/env";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GenerateResponse {
  answer: string;
  unanswered: boolean;
}

export async function generateAnswer(prompt: string): Promise<GenerateResponse> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "";

    const unanswered = 
      answer.toLowerCase().includes("don't have that information") ||
      answer.toLowerCase().includes("pass your question");

    return { answer, unanswered };
  } catch (error: any) {
    console.error("[rag] Groq error:", error.message);
    return {
      answer: "I'm having trouble answering right now. Please try again.",
      unanswered: true,
    };
  }
}