// src/app/(dashboard)/settings/page.tsx
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/dashboard/copy-button";

async function SettingsContent() {
  const ctx = await requireAuth();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${ctx.tenant.publicId}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Settings</h1>
        <p className="text-sm text-neutral-500">
          Manage your workspace and public chat link.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Workspace Info */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Workspace ID</p>
              <p className="text-sm font-mono text-neutral-900">{ctx.tenant.id}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Public ID</p>
              <p className="text-sm font-mono text-neutral-900">{ctx.tenant.publicId}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Status</p>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded">
                {ctx.tenant.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Public Chat Link */}
        <Card>
          <CardHeader>
            <CardTitle>Public chat link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-600">
              Share this link with your visitors. They can chat with your AI assistant — no login required.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-neutral-50 border border-neutral-200 px-3 py-2 rounded font-mono truncate">
                {publicUrl}
              </code>
              <CopyButton text={publicUrl} />
            </div>
            <p className="text-xs text-neutral-500">
              Note: Embed script (iframe) will be available in a future phase.
            </p>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Email</p>
              <p className="text-sm text-neutral-900">{ctx.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Name</p>
              <p className="text-sm text-neutral-900">{ctx.user.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Role</p>
              <p className="text-sm text-neutral-900 capitalize">{ctx.user.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-3">
              Deleting your account will permanently remove all your data — workspace, knowledge base, chats, and leads. This cannot be undone.
            </p>
            <p className="text-xs text-neutral-500">
              Use the account menu in the top-right corner to delete your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}