// src/lib/llm/call-model.ts
import { env } from "@/lib/env";

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export type ProviderName = "gemini" | "groq" | "cerebras" | "cloudflare" | "openrouter";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderName;
  model: string;
  baseUrl: string;
  apiKey: string | undefined;
}

function getProviders(): ModelConfig[] {
  const providers: ModelConfig[] = [
    {
      id: "gemini-flash",
      name: "Gemini 2.0 Flash",
      provider: "gemini",
      model: "gemini-2.0-flash",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: env.GEMINI_API_KEY,
    },
    {
      id: "groq-llama",
      name: "Groq Llama 3.1 8B",
      provider: "groq",
      model: "llama-3.1-8b-instant",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: env.GROQ_API_KEY,
    },
    {
      id: "cerebras-gpt-oss",
      name: "Cerebras GPT-OSS 20B",
      provider: "cerebras",
      model: "gpt-oss-20b",
      baseUrl: "https://api.cerebras.ai/v1",
      apiKey: env.CEREBRAS_API_KEY,
    },
    {
      id: "cloudflare-llama",
      name: "Cloudflare Llama 3.3 70B",
      provider: "cloudflare",
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      baseUrl: `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
      apiKey: env.CLOUDFLARE_API_TOKEN,
    },
  ];

  return providers.filter((p) => !!p.apiKey);
}

export async function callModel(
  messages: LLMMessage[],
  preferredModelId?: string,
  stream: boolean = false
): Promise<Response> {
  const providers = getProviders();
  const ordered = preferredModelId
    ? [
        ...providers.filter((p) => p.id === preferredModelId),
        ...providers.filter((p) => p.id !== preferredModelId),
      ]
    : providers;

  if (ordered.length === 0) {
    throw new Error("No LLM providers configured. Add at least one API key.");
  }

  let lastError: Error | null = null;

  for (const provider of ordered) {
    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          temperature: 0.3,
          max_tokens: 500,
          stream,
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        console.warn(`[llm] ${provider.name} returned ${response.status}, trying next...`);
        lastError = new Error(`${provider.name}: ${response.status}`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`${provider.name}: ${response.statusText}`);
      }

      return response;
    } catch (err: any) {
      console.warn(`[llm] ${provider.name} failed:`, err.message);
      lastError = err;
      continue;
    }
  }

  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}