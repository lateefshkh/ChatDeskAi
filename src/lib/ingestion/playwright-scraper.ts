// src/lib/ingestion/playwright-scraper.ts
import { chromium as playwright } from "playwright-core";
import chromium from "@sparticuz/chromium";

export interface ScrapedPage {
  url: string;
  text: string;
}

export async function scrapeFullWebsite(
  startUrl: string,
  maxPages: number = 15
): Promise<ScrapedPage[]> {
  // 1. Validation
  const parsedUrl = new URL(startUrl);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP/HTTPS URLs are allowed");
  }

  // 2. Browser Launch Configuration (Local vs Vercel)
  const isLocal = process.env.NODE_ENV === "development";
  
  let executablePath: string | undefined;
  let args: string[] = [];

  if (isLocal) {
    // Mac/Local environment ke liye system Chrome use karein
    executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    args = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ];
    console.log("[scraper] Running in LOCAL mode using system Chrome");
  } else {
    // Vercel/Production ke liye @sparticuz/chromium
    executablePath = await chromium.executablePath();
    args = chromium.args;
    console.log("[scraper] Running in VERCEL mode using @sparticuz/chromium");
  }

  const browser = await playwright.launch({
    args,
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  const baseUrl = parsedUrl.origin;
  const visited = new Set<string>();
  const queue = [startUrl];
  const results: ScrapedPage[] = [];

  try {
    // 3. Sitemap se URLs nikaalein (agar available ho)
    try {
      await page.goto(`${baseUrl}/sitemap.xml`, { timeout: 10000 });
      const sitemapContent = await page.content();
      const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        urlMatches.forEach((match) => {
          const url = match.replace(/<\/?loc>/g, "");
          if (url.startsWith(baseUrl) && !visited.has(url)) {
            queue.push(url);
          }
        });
        console.log(`[scraper] Found ${urlMatches.length} URLs in sitemap`);
      }
    } catch {
      console.log("[scraper] No sitemap found, will crawl from links.");
    }

    // 4. Deep Crawl
    while (queue.length > 0 && results.length < maxPages) {
      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        console.log(`[scraper] Scraping (${results.length + 1}/${maxPages}): ${currentUrl}`);
        await page.goto(currentUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });

        // JavaScript render hone ka wait
        await page.waitForTimeout(1500);

        const text = await page.evaluate(() => document.body.innerText);
        if (text && text.trim().length > 200) {
          results.push({ url: currentUrl, text: text.trim() });
        }

        // Naye links nikaalein
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("a"))
            .map((a) => (a as HTMLAnchorElement).href)
            .filter((href) => href.startsWith(window.location.origin));
        });

        links.forEach((link) => {
          const cleanLink = link.split("#")[0];
          if (cleanLink && !visited.has(cleanLink) && !queue.includes(cleanLink)) {
            queue.push(cleanLink);
          }
        });
      } catch (err: any) {
        console.warn(`[scraper] Failed: ${currentUrl}`, err.message);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`[scraper] Completed. Scraped ${results.length} pages.`);
  return results;
}