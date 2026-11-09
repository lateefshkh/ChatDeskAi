// src/lib/scraper/scraper.ts
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const MAX_PAGES = 15;
const MAX_CHUNKS = 200;

// SSRF blocklist
const BLOCKED_HOSTS = [
  "localhost", "127.0.0.1", "0.0.0.0", "::1",
  "169.254.169.254", // AWS metadata
];

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (BLOCKED_HOSTS.includes(parsed.hostname)) return false;
    // Block private IP ranges
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function scrapeWebsite(
  startUrl: string,
  maxPages: number = MAX_PAGES
): Promise<{ url: string; title: string; text: string }[]> {
  const results: { url: string; title: string; text: string }[] = [];
  const visited = new Set<string>();
  const queue = [startUrl];
  const baseDomain = new URL(startUrl).hostname;

  while (queue.length > 0 && visited.size < maxPages) {
    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl) || !isSafeUrl(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const page = await fetchPage(currentUrl);
      if (page) results.push(page);

      // Find links on page (same domain only)
      if (results.length < maxPages) {
        const links = await extractLinks(currentUrl);
        for (const link of links) {
          if (new URL(link).hostname === baseDomain && !visited.has(link)) {
            queue.push(link);
          }
        }
      }
    } catch (err) {
      console.warn(`[scraper] Failed ${currentUrl}:`, err);
    }
  }

  return results;
}

async function fetchPage(url: string): Promise<{ url: string; title: string; text: string } | null> {
  try {
    // 1. Try direct fetch + Readability
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ChatDeskBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article?.textContent && article.textContent.length > 100) {
      return { url, title: article.title || url, text: article.textContent.trim() };
    }

    // 2. Fallback to Jina Reader (for JS-heavy sites)
    return await fetchWithJina(url);
  } catch (err) {
    // Fallback to Jina on any failure
    return await fetchWithJina(url);
  }
}

async function fetchWithJina(url: string): Promise<{ url: string; title: string; text: string } | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: { "Authorization": `Bearer ${process.env.JINA_API_KEY || ""}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;
    const text = await response.text();
    if (text.length < 100) return null;

    return { url, title: url, text };
  } catch {
    return null;
  }
}

async function extractLinks(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await response.text();
    const dom = new JSDOM(html);
    const links = Array.from(dom.window.document.querySelectorAll("a[href]"))
      .map((a) => a.getAttribute("href"))
      .filter((href): href is string => !!href)
      .map((href) => {
        try {
          return new URL(href, url).toString();
        } catch {
          return null;
        }
      })
      .filter((link): link is string => !!link);
    return [...new Set(links)];
  } catch {
    return [];
  }
}