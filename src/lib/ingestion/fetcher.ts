// src/lib/ingestion/fetcher.ts
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export async function fetchAndExtractText(url: string): Promise<string> {
  // 1. URL validate karein (SSRF protection ke liye basic check)
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP/HTTPS URLs are allowed");
  }

  // 2. Fetch karein (with timeout)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatDeskBot/1.0)",
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);
    
    // Content-Type check karein
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error("URL must be an HTML page");
    }

    const html = await response.text();

    // 3. Readability se clean text nikaalein
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new Error("Could not extract meaningful text from URL");
    }

    return article.textContent.trim();
  } finally {
    clearTimeout(timeout);
  }
}