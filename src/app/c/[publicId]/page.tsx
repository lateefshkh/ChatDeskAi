// src/app/c/[publicId]/page.tsx
import { Suspense } from "react";
import { ChatClient } from "./chat-client";

// Async component jo params ko unwrap karega
async function ChatWrapper({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  return <ChatClient publicId={publicId} />;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      }
    >
      <ChatWrapper params={params} />
    </Suspense>
  );
}