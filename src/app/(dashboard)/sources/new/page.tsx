// src/app/(dashboard)/sources/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, FileText, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

type SourceType = "url" | "text";
type ScrapingMode = "vercel" | "local";

export default function NewSourcePage() {
  const router = useRouter();
  const [type, setType] = useState<SourceType>("url");
  const [mode, setMode] = useState<ScrapingMode>("vercel");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setLoading(true);

    try {
      console.log("[client] Submitting:", { type, label, mode, contentLength: content.length });

      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, label, content, mode }),
      });

      // ✅ Step 1: Raw text padho — kabhi crash nahi karega
      const rawText = await res.text();

      // ✅ Step 2: Console + UI mein dikhao
      console.log("[client] Status:", res.status);
      console.log("[client] StatusText:", res.statusText);
      console.log("[client] Raw response:", rawText);
      console.log("[client] Content-Type:", res.headers.get("content-type"));

      setDebugInfo(`HTTP ${res.status} — body length: ${rawText.length}`);

      // ✅ Step 3: Empty response pakdo
      if (!rawText || rawText.trim() === "") {
        throw new Error(
          `Server returned EMPTY response (HTTP ${res.status}). ` +
          `Likely: function crashed/timed out before responding. Check server terminal for stack trace.`
        );
      }

      // ✅ Step 4: JSON parse karo safely
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned non-JSON response (HTTP ${res.status}): ` +
          rawText.slice(0, 300)
        );
      }

      // ✅ Step 5: HTTP error handle karo
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (HTTP ${res.status})`);
      }

      console.log("[client] Success:", data);
      router.push("/sources");
      router.refresh();
    } catch (err: any) {
      console.error("[client] Submit error:", err);
      setError(err?.message ?? String(err));
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/sources"
          className="text-xs font-semibold text-[#0D4B37] hover:underline mb-3 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sources</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">Add Knowledge Source</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Train your assistant with website documentation or raw text.
        </p>
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)]">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("url")}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === "url"
                  ? "bg-[#0D4B37] text-white shadow-sm"
                  : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Website URL</span>
            </button>
            <button
              type="button"
              onClick={() => setType("text")}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === "text"
                  ? "bg-[#0D4B37] text-white shadow-sm"
                  : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Text</span>
            </button>
          </div>

          {/* Mode Selection (Only for URL) */}
          {type === "url" && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#18181B]">
                Scraping Mode
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("vercel")}
                  className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    mode === "vercel"
                      ? "bg-[#E8F3EE] text-[#0D4B37] border border-[#CDE5DA]"
                      : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#71717A]"
                  }`}
                >
                  Cloud (Fast, up to 5 pages)
                </button>
                <button
                  type="button"
                  onClick={() => setMode("local")}
                  className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    mode === "local"
                      ? "bg-[#E8F3EE] text-[#0D4B37] border border-[#CDE5DA]"
                      : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#71717A]"
                  }`}
                >
                  Deep Crawl (Up to 50 pages)
                </button>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                {mode === "vercel"
                  ? "Standard mode. Scrapes top pages within seconds."
                  : "Comprehensive crawl for larger documentation sites."}
              </p>
            </div>
          )}

          {/* Label */}
          <div className="space-y-1.5">
            <label htmlFor="label" className="block text-xs font-semibold text-[#18181B]">
              Source Label
            </label>
            <input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === "url" ? "e.g. Acme Documentation" : "e.g. Return Policy FAQ"}
              required
              className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label htmlFor="content" className="block text-xs font-semibold text-[#18181B]">
              {type === "url" ? "Target Website URL" : "Knowledge Text Content"}
            </label>
            {type === "url" ? (
              <input
                id="content"
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://docs.yourcompany.com"
                required
                className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
              />
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste product documentation, FAQs, or support articles here..."
                required
                rows={8}
                className="w-full px-4 py-3 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all resize-y"
              />
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Error</div>
                <div className="mt-1 break-words">{error}</div>
                {debugInfo && (
                  <div className="mt-1 text-[10px] text-red-500">{debugInfo}</div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="tactile-pill-secondary px-6 py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="tactile-pill-btn flex-1 py-2.5 px-5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Indexing...</span>
                </>
              ) : (
                <span>Add Knowledge Source</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}