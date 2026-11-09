// src/app/(dashboard)/chats/[id]/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getConversationById } from "@/lib/dal/conversations";
import { listMessagesByConversation } from "@/lib/dal/messages";
import { ArrowLeft, User, Bot } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/chats"
          className="text-xs font-semibold text-[#0D4B37] hover:underline mb-3 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all chats</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">
          Conversation with Visitor {conversation.visitorId.slice(-6)}
        </h1>
        <p className="text-xs text-[#71717A] mt-1 font-mono">
          {messages.length} message{messages.length !== 1 ? "s" : ""} -{" "}
          {new Date(conversation.createdAt).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Messages Feed */}
      <div className="bg-white rounded-[32px] border border-black/[0.04] shadow-sm p-6 sm:p-8 space-y-4 max-h-[72vh] overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === "user"
                  ? "bg-[#0D4B37] text-white"
                  : "bg-[#E8F3EE] text-[#0D4B37]"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] px-5 py-3.5 rounded-[22px] text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#0D4B37] text-white rounded-tr-sm shadow-sm"
                  : "bg-[#F8F7F3] border border-[#EDECE6] text-[#18181B] rounded-tl-sm shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div
                className={`text-[10px] mt-1 font-mono ${
                  m.role === "user" ? "text-white/70 text-right" : "text-[#A1A1AA]"
                }`}
              >
                {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
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
    <Suspense fallback={<div className="text-center py-8 text-xs text-[#71717A]">Loading conversation...</div>}>
      <ConversationDetailContent conversationId={id} />
    </Suspense>
  );
}
