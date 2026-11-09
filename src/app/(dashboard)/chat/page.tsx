// src/app/(dashboard)/chat/page.tsx
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { ChatClient } from "@/app/c/[publicId]/chat-client";

async function LiveChatContent() {
  const ctx = await requireAuth();

  return (
    // Full height minus header, flex column
    <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
      {/* Chat Box Container - No text headers now */}
      <div className="w-full h-full max-h-[750px]">
        <ChatClient publicId={ctx.tenant.publicId} />
      </div>
    </div>
  );
}

export default function LiveChatPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
      <LiveChatContent />
    </Suspense>
  );
}