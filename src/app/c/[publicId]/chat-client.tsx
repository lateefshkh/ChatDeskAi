// src/app/c/[publicId]/chat-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { LeadForm } from "@/components/chat/lead-form";

export function ChatClient({ publicId }: { publicId: string }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Naya State: Lead form dikhana hai ya nahi
  const [showLeadForm, setShowLeadForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showLeadForm]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId,
          message: userMessage,
          conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);

      // Agar AI ka jawab unanswered tha, to lead form dikhayein
      if (data.unanswered) {
        setShowLeadForm(true);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-neutral-200 flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-lg font-semibold text-neutral-900">Chat with us</h1>
          <p className="text-xs text-neutral-500">Powered by ChatDesk</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-neutral-400 py-8">
              Ask me anything about our business.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                m.role === "user"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 px-3 py-2 rounded-lg">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Lead Form (conditional) */}
        {showLeadForm && (
          <LeadForm 
            publicId={publicId} 
            conversationId={conversationId} 
            onSuccess={() => {
              setShowLeadForm(false);
              setMessages((prev) => [...prev, { role: "assistant", content: "Thank you! We'll be in touch soon." }]);
            }}
          />
        )}

        {/* Input */}
        {!showLeadForm && (
          <form onSubmit={handleSend} className="p-4 border-t border-neutral-200">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}