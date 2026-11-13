// src/lib/ingestion/playwright-scraper.ts
import { chromium as playwrightChromium } from "playwright-core";
import chromiumPkg from "@sparticuz/chromium";
import fs from "node:fs";
import path from "node:path";

// ✅ Type assertion — TypeScript ko batao ki yeh properties exist karti hain
const chromium = chromiumPkg as unknown as {
  args: string[];
  executablePath: (location?: string) => Promise<string>;
};

export interface ScrapedPage {
  url: string;
  text: string;
}

interface QueueItem {
  url: string;
  depth: number;
}

const PRIORITY_PATTERNS: RegExp[] = [];

const SKIP_PATTERNS: RegExp[] = [
  /\/hindi\//,
  /\/js\//,
  /\/css\//,
  /\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|doc|docx|xls|xlsx)$/i,
  /\?/,
];

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  url = url.replace(/^ttps:\/\//i, "https://");
  url = url.replace(/^htp:\/\//i, "http://");
  url = url.replace(/^htps:\/\//i, "https://");
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

function shouldEnqueue(url: string, baseUrl: string): boolean {
  if (!url.startsWith(baseUrl)) return false;
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(url)) return false;
  }
  if (PRIORITY_PATTERNS.length > 0) {
    return PRIORITY_PATTERNS.some((p) => p.test(url));
  }
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeFullWebsite(
  startUrlRaw: string,
  maxPages: number = 50,
  maxDepth: number = 3,
  outputFile: string = "scrape-results.jsonl"
): Promise<ScrapedPage[]> {
  const startUrl = normalizeUrl(startUrlRaw);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(startUrl);
  } catch {
    throw new Error(`Invalid URL: ${startUrlRaw}`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`Only HTTP/HTTPS URLs are allowed, got: ${parsedUrl.protocol}`);
  }

  const isLocal = process.env.NODE_ENV === "development";

  const outputPath = path.resolve(process.cwd(), outputFile);
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log(`[scraper] Cleared old output: ${outputFile}`);
  }
  console.log(`[scraper] Streaming results to: ${outputPath}`);

  let browser;

  if (isLocal) {
    console.log("[scraper] LOCAL mode — system Chrome");
    browser = await playwrightChromium.launch({
      channel: "chrome",
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--disable-gpu",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });
  } else {
    console.log("[scraper] VERCEL mode — @sparticuz/chromium");

    let executablePath = "";
    try {
      const binPath = path.join(
        process.cwd(),
        "node_modules/@sparticuz/chromium/bin"
      );
      console.log(`[scraper] Checking binPath: ${binPath}`);
      console.log(`[scraper] binPath exists: ${fs.existsSync(binPath)}`);

      if (fs.existsSync(binPath)) {
        executablePath = await chromium.executablePath(binPath);
        console.log(`[scraper] Found via binPath: ${executablePath}`);
      } else {
        console.log("[scraper] binPath NOT found, trying default...");
        executablePath = await chromium.executablePath();
        console.log(`[scraper] Default path: ${executablePath}`);
      }
    } catch (e: any) {
      console.error("[scraper] Error resolving executable path:", e?.message);
      executablePath = await chromium.executablePath();
    }

    process.env.LD_LIBRARY_PATH = path.dirname(executablePath);

    const chromiumArgs = chromium.args || [];

    browser = await playwrightChromium.launch({
      args: [...chromiumArgs, "--disable-blink-features=AutomationControlled"],
      executablePath,
      headless: true,
      ignoreDefaultArgs: ["--enable-automation"],
    });
  }

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });

  let page = await context.newPage();

  const baseUrl = parsedUrl.origin;
  const visited = new Set<string>();
  const queue: QueueItem[] = [{ url: startUrl, depth: 0 }];
  const results: ScrapedPage[] = [];
  let pageCount = 0;
  let failedCount = 0;

  try {
    try {
      console.log("[scraper] Fetching sitemap...");
      await page.goto(`${baseUrl}/sitemap.xml`, { timeout: 15000 });
      const sitemapContent = await page.content();
      const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        let addedFromSitemap = 0;
        urlMatches.forEach((match) => {
          const url = match.replace(/<\/?loc>/g, "").trim();
          if (shouldEnqueue(url, baseUrl) && !visited.has(url)) {
            queue.push({ url, depth: 1 });
            addedFromSitemap++;
          }
        });
        console.log(
          `[scraper] Sitemap: ${urlMatches.length} total, ${addedFromSitemap} queued`
        );
      }
    } catch {
      console.log("[scraper] No sitemap — crawling via links only");
    }

    console.log(`[scraper] Starting crawl: maxPages=${maxPages}, maxDepth=${maxDepth}`);

    while (queue.length > 0 && results.length < maxPages) {
      const item = queue.shift()!;
      const currentUrl = item.url;

      if (visited.has(currentUrl)) continue;
      if (item.depth > maxDepth) continue;
      visited.add(currentUrl);

      try {
        console.log(
          `[scraper] (${results.length + 1}/${maxPages}) depth=${item.depth} ${currentUrl}`
        );

        await page.goto(currentUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        await page.waitForTimeout(4000);

        const text = await page.evaluate(() => {
          const flattenShadowDom = (root: Element | Document) => {
            for (const el of root.querySelectorAll("*")) {
              if ((el as any).shadowRoot) {
                el.innerHTML = (el as any).shadowRoot.innerHTML;
              }
            }
          };
          flattenShadowDom(document.body);
          return document.body.innerText;
        });

        if (text && text.trim().length > 200) {
          const trimmed = text.trim();
          fs.appendFileSync(
            outputPath,
            JSON.stringify({ url: currentUrl, text: trimmed }) + "\n"
          );
          results.push({ url: currentUrl, text: trimmed });
          console.log(`[scraper]   → saved (${trimmed.length} chars)`);
        } else {
          console.log(`[scraper]   → skipped (too short: ${text?.length ?? 0} chars)`);
        }

        if (item.depth < maxDepth) {
          const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a"))
              .map((a) => (a as HTMLAnchorElement).href)
              .filter((href) => href && href.startsWith(window.location.origin));
          });

          let newLinks = 0;
          links.forEach((link) => {
            const cleanLink = link.split("#")[0];
            if (
              cleanLink &&
              !visited.has(cleanLink) &&
              !queue.some((q) => q.url === cleanLink) &&
              shouldEnqueue(cleanLink, baseUrl)
            ) {
              queue.push({ url: cleanLink, depth: item.depth + 1 });
              newLinks++;
            }
          });

          if (newLinks > 0) {
            console.log(
              `[scraper]   → +${newLinks} new links queued (queue=${queue.length})`
            );
          }
        }

        pageCount++;
        await sleep(2000 + Math.random() * 2000);
      } catch (err: any) {
        failedCount++;
        console.warn(`[scraper] Failed: ${currentUrl} — ${err?.message ?? err}`);
      }
    }
  } finally {
    try {
      await browser.close();
    } catch {}
  }

  console.log("====================================================");
  console.log(`[scraper] ✅ COMPLETED`);
  console.log(`[scraper]   Pages scraped: ${results.length}`);
  console.log(`[scraper]   Pages failed:  ${failedCount}`);
  console.log(`[scraper]   URLs visited:  ${visited.size}`);
  console.log(`[scraper]   Output file:   ${outputFile}`);
  console.log("====================================================");

  return results;
}