// src/app/(dashboard)/layout.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/lib/auth/session";
import { AccountMenu } from "@/components/auth/account-menu";

async function DashboardHeader() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.user.emailVerified) redirect("/login?verified=0");

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* LEFT SIDE: Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-semibold text-neutral-900">
            ChatDesk
          </Link>
          {ctx.tenant && (
            <span className="text-sm text-neutral-500 hidden sm:inline">
              {ctx.tenant.publicId}
            </span>
          )}
          
          {/* YAHAN HAI NAVIGATION: Dashboard aur Billing */}
          <nav className="hidden md:flex items-center gap-4 ml-4">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
            >
              Dashboard
            </Link>
            <Link 
              href="/billing" 
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Billing
            </Link>
          </nav>
        </div>

        {/* RIGHT SIDE: Account Dropdown */}
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