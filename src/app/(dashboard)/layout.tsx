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
    <div className="min-h-screen bg-[#F4F3EE] bg-[radial-gradient(ellipse_at_top_right,rgba(200,109,81,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(19,66,53,0.06),transparent_50%)] text-[#111827] relative overflow-x-clip max-w-full">
      {/* Floating Tactile TopNav */}
      <TopNav email={ctx.user.email} isAdmin={isAdmin} />

      <main className="max-w-6xl mx-auto px-3.5 pt-20 pb-8 sm:px-6 sm:pt-24 sm:pb-10 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
