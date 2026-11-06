// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import { requireAuth } from "../../../lib/auth/require-auth";

async function DashboardContent() {
  const ctx = await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Welcome, {ctx.user.name || ctx.user.email}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500 mb-2">Your Workspace</h2>
          <p className="text-lg font-semibold text-neutral-900">
            {ctx.tenant.publicId}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Status: {ctx.tenant.status}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500 mb-2">Account</h2>
          <p className="text-sm text-neutral-900">{ctx.user.email}</p>
          <p className="text-xs text-neutral-500 mt-1">
            Role: {ctx.user.role}
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Phase 1 Complete! 🎉
        </h2>
        <p className="text-sm text-neutral-600">
          Authentication is fully working. Next up (Phase 2):
        </p>
        <ul className="mt-3 space-y-1 text-sm text-neutral-600">
          <li>• Tenant-scoped data access layer</li>
          <li>• Knowledge sources (URL, PDF, text)</li>
          <li>• Chat interface</li>
          <li>• Leads + notifications</li>
        </ul>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}