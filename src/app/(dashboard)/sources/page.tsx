// src/app/(dashboard)/sources/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { listSources } from "@/lib/dal/sources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function SourcesContent() {
  const ctx = await requireAuth();
  const sources = await listSources(ctx.tenant.id);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Sources</h1>
          <p className="text-sm text-neutral-500">Your knowledge base.</p>
        </div>
        <Link href="/sources/new">
          <Button>Add source</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All sources ({sources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-400">
              No sources yet.{" "}
              <Link href="/sources/new" className="underline">
                Add your first source
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{source.label}</p>
                    <p className="text-xs text-neutral-500">
                      {source.type} · {source.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <SourceDeleteButton sourceId={source.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SourcesPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-neutral-400">Loading...</div>}>
      <SourcesContent />
    </Suspense>
  );
}

// Client component for delete button (will be replaced with actual client component)
import { SourceDeleteButton } from "../../../components/dashboard/source-delete-button";