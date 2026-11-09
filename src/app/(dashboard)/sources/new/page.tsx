// src/app/(dashboard)/sources/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type SourceType = "url" | "text";
type ScrapingMode = "vercel" | "local";

export default function NewSourcePage() {
  const router = useRouter();
  const [type, setType] = useState<SourceType>("url");
  const [mode, setMode] = useState<ScrapingMode>("vercel"); // <-- NAYA
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, label, content, mode }), // <-- mode bhejein
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create source");

      router.push("/sources");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Add knowledge source</h1>
        <p className="text-sm text-muted-foreground">
          Train your AI assistant with website links or text.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Type Selection */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType("url")}
                className={`flex-1 py-3 px-4 border rounded-lg text-sm font-medium transition-colors ${
                  type === "url"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                Website URL
              </button>
              <button
                type="button"
                onClick={() => setType("text")}
                className={`flex-1 py-3 px-4 border rounded-lg text-sm font-medium transition-colors ${
                  type === "text"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Mode Selection (Only for URL) */}
            {type === "url" && (
              <div>
                <Label className="mb-2 block">Scraping Mode</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMode("vercel")}
                    className={`flex-1 py-3 px-4 border rounded-lg text-sm font-medium transition-colors ${
                      mode === "vercel"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Vercel (Fast, 5 pages)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("local")}
                    className={`flex-1 py-3 px-4 border rounded-lg text-sm font-medium transition-colors ${
                      mode === "local"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Local (Deep, 50 pages)
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {mode === "vercel"
                    ? "Best for deployed app. Scrapes up to 5 pages (fits Vercel 10s limit)."
                    : "Best for local testing. Scrapes up to 50 pages (may take 1-2 minutes)."}
                </p>
              </div>
            )}

            {/* Label */}
            <div className="space-y-1.5">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={type === "url" ? "e.g. Main website" : "e.g. FAQ document"}
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label htmlFor="content">
                {type === "url" ? "Website URL" : "Content"}
              </Label>
              {type === "url" ? (
                <Input
                  id="content"
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              ) : (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your text here..."
                  required
                  rows={8}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Processing..." : "Add source"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}