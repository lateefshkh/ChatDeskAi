// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.user.emailVerified) redirect("/login?verified=0");

  const publicChatUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${ctx.tenant?.publicId ?? ""}`;

  return (
    // Full-height shell: sidebar on left, content on right
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar (desktop sticky / mobile drawer) */}
      <SidebarNav email={ctx.user.email} publicChatUrl={publicChatUrl} />

      {/* Main area */}
      <main
        // On mobile: top-14 to clear fixed mobile header
        className="flex-1 min-w-0 px-5 py-7 lg:px-8 lg:py-8 mt-14 lg:mt-0 overflow-y-auto"
      >
        {children}
      </main>
    </div>
  );
}
