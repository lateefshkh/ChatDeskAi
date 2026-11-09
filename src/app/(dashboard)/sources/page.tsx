// src/app/(dashboard)/sources/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { listSources } from "@/lib/dal/sources";
import { SkeletonPageHeader, SkeletonSourceRow } from "@/components/dashboard/skeleton";
import { SourceDeleteButton } from "../../../components/dashboard/source-delete-button";
import { Database, Plus, Globe, FileText, CheckCircle2 } from "lucide-react";

async function SourcesContent() {
  const ctx = await requireAuth();
  const sources = await listSources(ctx.tenant.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E3EDE7] border border-[#C5DCD0] text-[#134235] text-xs font-semibold mb-2">
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Sources</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Websites, documentation, and text guides indexed for your assistant.
          </p>
        </div>

        <Link
          href="/sources/new"
          className="tactile-pill-btn text-xs font-semibold px-5 py-2.5 inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Source</span>
        </Link>
      </div>

      {/* Sources List Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EFEA]">
          <h2 className="text-base font-bold text-[#18181B]">
            All Knowledge Sources ({sources.length})
          </h2>
          <span className="text-xs text-[#71717A]">Synchronized</span>
        </div>

        {sources.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-[#F4F3EE] flex items-center justify-center mx-auto mb-3 text-[#71717A]">
              <Database className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#18181B] mb-1">No knowledge sources added yet</p>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-5 leading-relaxed">
              Add your website URL or paste text guides so your AI can start answering visitor inquiries.
            </p>
            <Link
              href="/sources/new"
              className="tactile-pill-btn text-xs font-semibold px-5 py-2.5 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add your first source</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-4 bg-[#F8F7F3] rounded-2xl border border-[#EDECE6] hover:border-[#DDD9D0] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#DDD7CD] flex items-center justify-center text-[#134235] shrink-0 shadow-sm">
                    {source.type === "url" ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111827] truncate">{source.label}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-2">
                      <span className="uppercase font-mono font-medium">{source.type}</span>
                      <span>-</span>
                      <span className="capitalize text-[#134235] font-semibold">{source.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <SourceDeleteButton sourceId={source.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <SkeletonPageHeader wide />
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonSourceRow key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SourcesContent />
    </Suspense>
  );
}
