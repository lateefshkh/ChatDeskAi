// src/app/(dashboard)/sources/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileUp,
  Sliders,
  Table,
} from "lucide-react";

type SourceType = "url" | "text" | "pdf" | "sheet";
type ScrapingMode = "vercel" | "local" | "custom";

const CUSTOM_PAGES_OPTIONS = [10, 30, 50, 70, 100, 200, 300, 400, 500];

export default function NewSourcePage() {
  const router = useRouter();
  const [type, setType] = useState<SourceType>("url");
  const [mode, setMode] = useState<ScrapingMode>("vercel");
  const [customPages, setCustomPages] = useState<number>(100);
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const isFileType = type === "pdf" || type === "sheet";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setLoading(true);

    try {
      let res: Response;

      if (isFileType) {
        if (!file) throw new Error(`Please select a ${type === "pdf" ? "PDF" : "spreadsheet"} file`);

        const formData = new FormData();
        formData.append("type", type);
        formData.append("label", label);
        formData.append("mode", mode);
        if (mode === "custom") formData.append("customPages", String(customPages));
        formData.append("file", file);

        res = await fetch("/api/sources", {
          method: "POST",
          body: formData,
        });
      } else {
        const body: any = { type, label, content, mode };
        if (mode === "custom") body.customPages = customPages;

        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const rawText = await res.text();
      setDebugInfo(`HTTP ${res.status} — body length: ${rawText.length}`);

      if (!rawText || rawText.trim() === "") {
        throw new Error(
          `Server returned EMPTY response (HTTP ${res.status}). Check server terminal.`
        );
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Non-JSON response (HTTP ${res.status}): ${rawText.slice(0, 300)}`
        );
      }

      if (!res.ok) throw new Error(data?.error || `Request failed (HTTP ${res.status})`);

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
          Train your assistant with websites, text, PDFs, or spreadsheets.
        </p>
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)]">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setType("url")}
              className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "url"
                  ? "bg-[#0D4B37] text-white shadow-sm"
                  : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </button>
            <button
              type="button"
              onClick={() => setType("text")}
              className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "text"
                  ? "bg-[#0D4B37] text-white shadow-sm"
                  : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => setType("pdf")}
              className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "pdf"
                  ? "bg-[#0D4B37] text-white shadow-sm"
                  : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setType("sheet")}
              className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "sheet"
                  ? "bg-[#0D4B37] text-white shadow-sm"
                  : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Spreadsheet</span>
            </button>
          </div>

          {/* Mode Selection (Only for URL) */}
          {type === "url" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#18181B]">
                Scraping Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("vercel")}
                  className={`py-3 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    mode === "vercel"
                      ? "bg-[#E8F3EE] text-[#0D4B37] border-2 border-[#0D4B37]"
                      : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#71717A] hover:border-[#0D4B37]/30"
                  }`}
                >
                  <div className="font-bold mb-0.5">Cloud</div>
                  <div className="text-[10px] opacity-80">5 pages · Fast</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("local")}
                  className={`py-3 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    mode === "local"
                      ? "bg-[#E8F3EE] text-[#0D4B37] border-2 border-[#0D4B37]"
                      : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#71717A] hover:border-[#0D4B37]/30"
                  }`}
                >
                  <div className="font-bold mb-0.5">Deep Crawl</div>
                  <div className="text-[10px] opacity-80">50 pages · Local</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`py-3 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    mode === "custom"
                      ? "bg-[#E8F3EE] text-[#0D4B37] border-2 border-[#0D4B37]"
                      : "bg-[#F9F8F5] border border-[#E4E2DC] text-[#71717A] hover:border-[#0D4B37]/30"
                  }`}
                >
                  <div className="font-bold mb-0.5 flex items-center gap-1">
                    <Sliders className="w-3 h-3" />
                    Custom
                  </div>
                  <div className="text-[10px] opacity-80">Choose pages</div>
                </button>
              </div>

              {mode === "custom" && (
                <div className="space-y-1.5 mt-2">
                  <label className="block text-xs font-semibold text-[#18181B]">
                    How many pages to scrape?
                  </label>
                  <select
                    value={customPages}
                    onChange={(e) => setCustomPages(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all cursor-pointer"
                  >
                    {CUSTOM_PAGES_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} pages
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#A1A1AA]">
                    Deeper crawl = more data, but slower. Local only.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-[#A1A1AA]">
                {mode === "vercel" &&
                  "Standard mode. Scrapes top 5 pages within seconds. Best for Vercel."}
                {mode === "local" &&
                  "Comprehensive crawl for larger sites. 50 pages. Local only."}
                {mode === "custom" &&
                  `Scrapes exactly ${customPages} pages. Local only — can take several minutes.`}
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
              placeholder={
                type === "url"
                  ? "e.g. Acme Documentation"
                  : type === "text"
                  ? "e.g. Return Policy FAQ"
                  : type === "pdf"
                  ? "e.g. SEBI Annual Report 2024"
                  : "e.g. Product Catalog"
              }
              required
              className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            {type === "url" && (
              <>
                <label htmlFor="content" className="block text-xs font-semibold text-[#18181B]">
                  Target Website URL
                </label>
                <input
                  id="content"
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://docs.yourcompany.com"
                  required
                  className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
                />
              </>
            )}

            {type === "text" && (
              <>
                <label htmlFor="content" className="block text-xs font-semibold text-[#18181B]">
                  Knowledge Text Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste product documentation, FAQs, or support articles here..."
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all resize-y"
                />
              </>
            )}

            {type === "pdf" && (
              <>
                <label htmlFor="file" className="block text-xs font-semibold text-[#18181B]">
                  Upload PDF File
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full px-4 py-3 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0D4B37] file:text-white hover:file:bg-[#0a3a2b] cursor-pointer"
                />
                {file && (
                  <p className="text-[11px] text-[#71717A] mt-1">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </>
            )}

            {type === "sheet" && (
              <>
                <label htmlFor="file" className="block text-xs font-semibold text-[#18181B]">
                  Upload Spreadsheet (Excel / CSV)
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full px-4 py-3 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0D4B37] file:text-white hover:file:bg-[#0a3a2b] cursor-pointer"
                />
                {file && (
                  <p className="text-[11px] text-[#71717A] mt-1">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-[11px] text-[#A1A1AA]">
                  Supports .xlsx, .xls, .csv. First row should be column headers.
                </p>
              </>
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