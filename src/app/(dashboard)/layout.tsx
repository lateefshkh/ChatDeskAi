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

  const isAdmin = ctx.user.role === "platform_admin";

  return (
    <div className="min-h-screen bg-[#F4F3EE] text-[#18181B] relative">
      {/* Soft Ambient Glows matching Homepage */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-amber-100/40 via-orange-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-emerald-100/30 via-teal-50/15 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Tactile TopNav */}
      <TopNav email={ctx.user.email} isAdmin={isAdmin} />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
