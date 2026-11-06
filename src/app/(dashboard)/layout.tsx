// src/app/(dashboard)/layout.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "../../lib/auth/session";
import { AccountMenu } from "../../components/auth/account-menu";

async function DashboardHeader() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.user.emailVerified) redirect("/login?verified=0");

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-semibold text-neutral-900">
            ChatDesk
          </Link>
          {ctx.tenant && (
            <span className="text-sm text-neutral-500">{ctx.tenant.publicId}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <AccountMenu email={ctx.user.email} />
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<header className="bg-white border-b border-neutral-200 h-16" />}>
        <DashboardHeader />
      </Suspense>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}