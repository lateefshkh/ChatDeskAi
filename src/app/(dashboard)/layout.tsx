// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { TopNav } from "@/components/dashboard/top-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.user.emailVerified) redirect("/login?verified=0");

  // ✅ Ab role check karein
  const isAdmin = ctx.user.role === "platform_admin";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav email={ctx.user.email} isAdmin={isAdmin} />
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}