// src/app/c/[publicId]/chat-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LeadForm } from "@/components/chat/lead-form";
import { ArrowRight, Bot, Send } from "lucide-react";

export function ChatClient({ publicId }: { publicId: string }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStarted = messages.length > 0 || showLeadForm;

  useEffect(() => {
    if (isStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showLeadForm, isStarted]);

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
        body: JSON.stringify({ publicId, message: userMessage, conversationId }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let isUnanswered = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                if (json.conversationId) setConversationId(json.conversationId);
                if (json.content) {
                  assistantMessage += json.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                    return updated;
                  });
                }
                if (json.unanswered) isUnanswered = true;
              } catch (e) {}
            }
          }
        }
      }

      const lowerAnswer = assistantMessage.toLowerCase();
      const hasDeclinePhrase =
        lowerAnswer.includes("don't have information") ||
        lowerAnswer.includes("not in my knowledge base") ||
        lowerAnswer.includes("share your contact details") ||
        lowerAnswer.includes("get back to you");

      if (isUnanswered || (hasDeclinePhrase && assistantMessage.length < 300)) {
        setShowLeadForm(true);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-[32px] border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)] flex flex-col h-full w-full overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-white">
        {/* Empty State */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out px-6 ${
            isStarted ? "opacity-0 pointer-events-none -translate-y-8" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="w-full max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-[#E3EDE7] text-[#134235] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#111827] mb-2 tracking-tight">
              How can we help?
            </h2>
            <p className="text-xs text-[#6B7280] mb-8">
              Ask any question about our products, documentation, or services.
            </p>

            <form onSubmit={handleSend} className="flex gap-2 items-center w-full">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 h-12 bg-[#F8F7F3] border border-[#DDD7CD] rounded-full px-5 text-xs text-[#111827] placeholder-[#A1A1AA] focus:outline-none focus:border-[#134235] focus:ring-2 focus:ring-[#134235]/10 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="tactile-pill-btn h-12 px-6 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Send</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-500 ease-in-out ${
            isStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#134235] text-white rounded-[22px] rounded-br-sm shadow-sm"
                      : "bg-[#F8F7F3] border border-[#EDECE6] text-[#111827] rounded-[22px] rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.content ? (
                    m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-xs text-[#111827] prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-[#111827] prose-strong:text-[#111827] prose-a:text-[#134235] prose-a:underline">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )
                  ) : (
                    <span className="flex gap-1.5 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-[#A1A1AA] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#A1A1AA] rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-[#A1A1AA] rounded-full animate-bounce delay-200" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showLeadForm && (
            <div className="bg-[#FAF9F5] border-t border-[#DDD7CD] shrink-0 p-5">
              <LeadForm
                publicId={publicId}
                conversationId={conversationId}
                onSuccess={() => {
                  setShowLeadForm(false);
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Thank you! We'll be in touch with you shortly." },
                  ]);
                }}
                onSkip={() => setShowLeadForm(false)}
              />
            </div>
          )}

          {!showLeadForm && (
            <div className="p-4 bg-white border-t border-[#F0EFEA] shrink-0">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  disabled={loading}
                  className="flex-1 h-11 bg-[#F8F7F3] border border-[#DDD7CD] rounded-full px-5 text-xs text-[#111827] placeholder-[#A1A1AA] focus:outline-none focus:border-[#134235] focus:ring-2 focus:ring-[#134235]/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="tactile-pill-btn h-11 px-5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
