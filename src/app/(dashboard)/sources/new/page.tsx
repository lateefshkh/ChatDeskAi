// src/app/(dashboard)/sources/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SourceType = "url" | "text";

export default function NewSourcePage() {
  const router = useRouter();
  const [type, setType] = useState<SourceType>("url");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState(""); // URL ya Text
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
        body: JSON.stringify({ type, label, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create source");

      // Success — dashboard pe wapas jayein
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Add knowledge source</h1>
        <p className="text-sm text-neutral-500">Train your AI assistant with website links or text.</p>
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
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Website URL
              </button>
              <button
                type="button"
                onClick={() => setType("text")}
                className={`flex-1 py-3 px-4 border rounded-lg text-sm font-medium transition-colors ${
                  type === "text"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Paste Text
              </button>
            </div>

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
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding..." : "Add source"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}