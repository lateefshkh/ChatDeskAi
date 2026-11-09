// src/app/c/[publicId]/page.tsx
import { Suspense } from "react";
import { ChatClient } from "./chat-client";

async function ChatWrapper({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  return (
    <div className="w-full max-w-3xl h-[88vh] max-h-[800px]">
      <ChatClient publicId={publicId} />
    </div>
  );
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#F4F3EE] text-[#18181B] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-amber-100/40 via-orange-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-emerald-100/30 via-teal-50/15 to-transparent blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="h-8 w-8 border-4 border-[#DDD9D0] border-t-[#0D4B37] rounded-full animate-spin" />
        }
      >
        <ChatWrapper params={params} />
      </Suspense>
    </div>
  );
}
