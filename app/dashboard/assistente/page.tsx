"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente de vendas da sua ótica. Posso te ajudar com informações sobre lentes, recomendar armações, tirar dúvidas sobre produtos e auxiliar no atendimento. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
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
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Desculpe, houve um erro." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, não consegui processar sua mensagem. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Assistente de Vendas
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Chat inteligente para te ajudar nas vendas.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 rounded-[16px] border border-border bg-bg-card flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-[12px] text-sm ${
                  msg.role === "user"
                    ? "bg-accent-green/20 text-text-primary"
                    : "bg-bg-card-hover text-text-secondary border border-border"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-bg-card-hover border border-border px-4 py-3 rounded-[12px] flex gap-1">
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pergunte sobre lentes, armações, preços..."
              className="flex-1 px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-50 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
