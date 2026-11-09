// src/app/(dashboard)/chats/[id]/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getConversationById } from "@/lib/dal/conversations";
import { listMessagesByConversation } from "@/lib/dal/messages";

async function ConversationDetailContent({
  conversationId,
}: {
  conversationId: string;
}) {
  const ctx = await requireAuth();
  const conversation = await getConversationById(ctx.tenant.id, conversationId);
  if (!conversation) notFound();

  const messages = await listMessagesByConversation(ctx.tenant.id, conversationId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/chats"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to chats
        </Link>
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Conversation with Visitor {conversation.visitorId.slice(-6)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""} ·{" "}
          {new Date(conversation.createdAt).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Messages */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
      <ConversationDetailContent conversationId={id} />
    </Suspense>
  );
}