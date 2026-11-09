// src/app/c/[publicId]/chat-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LeadForm } from "@/components/chat/lead-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

      // ✅ SMART DECLINE DETECTION
      const lowerAnswer = assistantMessage.toLowerCase();
      const hasDeclinePhrase =
        lowerAnswer.includes("don't have information") ||
        lowerAnswer.includes("not in my knowledge base") ||
        lowerAnswer.includes("share your contact details") ||
        lowerAnswer.includes("get back to you");

      // Lead form sirf tabhi khule jab jawab chhota ho AUR mana kar raha ho
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
    <div className="bg-card rounded-[32px] flex flex-col h-full w-full overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-card">
        
        {/* Empty State */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out px-8 ${isStarted ? "opacity-0 pointer-events-none -translate-y-8" : "opacity-100 translate-y-0"}`}>
          <div className="w-full max-w-md text-center">
            <h2 className="text-3xl font-bold text-ink mb-3 tracking-tight">How can we help?</h2>
            <p className="text-[17px] text-text mb-10">Ask me anything about your given sources.</p>
            
            <form onSubmit={handleSend} className="flex gap-3 items-center w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 h-14 bg-background border-none rounded-full px-6 shadow-none focus-visible:ring-2 focus-visible:ring-primary text-[17px]"
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()} 
                className="h-14 px-8 bg-primary hover:bg-primary/90 rounded-full text-white font-medium text-[17px] transition-colors"
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Chat Messages */}
        <div className={`absolute inset-0 flex flex-col transition-all duration-500 ease-in-out ${isStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
          
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 text-[17px] leading-relaxed ${
                  m.role === "user" 
                    ? "bg-primary text-white rounded-[24px] rounded-br-sm" 
                    : "bg-background text-ink rounded-[24px] rounded-bl-sm"
                }`}>
                  {m.content ? (
                    m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-ink prose-headings:font-bold prose-headings:mb-4 prose-strong:text-ink prose-a:text-primary prose-table:w-full prose-table:border-collapse prose-th:border-b prose-th:border-divider prose-th:pb-3 prose-th:text-left prose-td:border-b prose-td:border-divider prose-td:py-3">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeRaw]}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )
                  ) : (
                    <span className="flex gap-1.5 items-center h-5">
                      <span className="w-2 h-2 bg-text rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-text rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-text rounded-full animate-bounce delay-200" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showLeadForm && (
            <div className="bg-card shrink-0 p-8">
              <LeadForm
                publicId={publicId}
                conversationId={conversationId}
                onSuccess={() => {
                  setShowLeadForm(false);
                  setMessages((prev) => [...prev, { role: "assistant", content: "Thank you! We'll be in touch soon." }]);
                }}
                onSkip={() => setShowLeadForm(false)}
              />
            </div>
          )}

          {!showLeadForm && (
            <div className="p-6 shrink-0">
              <form onSubmit={handleSend} className="flex gap-3 items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 h-14 bg-background border-none rounded-full px-6 shadow-none focus-visible:ring-2 focus-visible:ring-primary text-[17px]"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !input.trim()} 
                  className="h-14 px-8 bg-primary hover:bg-primary/90 rounded-full text-white font-medium text-[17px] transition-colors"
                >
                  Send
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}