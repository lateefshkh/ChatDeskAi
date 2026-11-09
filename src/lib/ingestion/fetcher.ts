// src/lib/ingestion/fetcher.ts
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { env } from "@/lib/env";

// ─── SSRF Protection ─────────────────────────────────────────────────────
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    
    const hostname = parsed.hostname;
    // Block localhost & private IPs
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "169.254.169.254" || // AWS metadata
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^fc00::/.test(hostname) ||
      /^fe80::/.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// jina 
async function fetchWithJina(url: string): Promise<string | null> {
  try {
    // ✅ API key ke bina call karein (anonymous access)
    const response = await fetch(`https://r.jina.ai/${url}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.warn("[fetcher] Jina failed:", response.status);
      return null;
    }
    const text = await response.text();
    return text.length > 100 ? text : null;
  } catch (err: any) {
    console.warn("[fetcher] Jina error:", err.message);
    return null;
  }
}

// ─── Main Function ───────────────────────────────────────────────────────
export async function fetchAndExtractText(url: string): Promise<string> {
  if (!isSafeUrl(url)) {
    throw new Error("URL is not allowed (SSRF protection)");
  }

  // 1. Try normal fetch + readability (fast, free)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatDeskBot/1.0)",
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const html = await response.text();
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (article?.textContent && article.textContent.trim().length > 200) {
          return article.textContent.trim();
        }
      }
    }
  } catch (err: any) {
    console.warn("[fetcher] Direct fetch failed:", err.message);
  }

  // 2. Fallback to Jina (JS-heavy sites)
  console.log(`[fetcher] Falling back to Jina for: ${url}`);
  const jinaText = await fetchWithJina(url);
  if (jinaText) return jinaText;

  throw new Error("Failed to extract text from URL (both direct and Jina failed)");
}