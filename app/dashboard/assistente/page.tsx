"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bookmark, Trash2, ChevronDown, ChevronUp, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SavedResponse {
  id: string;
  content: string;
  created_at: string;
}

export default function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente técnico da sua ótica. Posso te ajudar com informações sobre lentes, armações, patologias oculares, cirurgias refrativas, dicas de venda e muito mais. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedResponse[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [savedMax, setSavedMax] = useState(20);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [expandedSaved, setExpandedSaved] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load saved responses on mount
  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/saved");
      const data = await res.json();
      if (data.responses) {
        setSaved(data.responses);
        setSavedCount(data.count);
        setSavedMax(data.max);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

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
        { role: "assistant", content: "Desculpe, não consegui processar sua mensagem. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg || msg.role !== "assistant") return;
    if (savedCount >= savedMax) return;

    setSavingIdx(msgIndex);
    try {
      const res = await fetch("/api/chat/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg.content }),
      });
      const data = await res.json();
      if (data.saved) {
        setSaved((prev) => [data.saved, ...prev]);
        setSavedCount((c) => c + 1);
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Erro ao salvar resposta");
    } finally {
      setSavingIdx(null);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      const res = await fetch("/api/chat/saved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.deleted) {
        setSaved((prev) => prev.filter((r) => r.id !== id));
        setSavedCount((c) => c - 1);
        if (expandedSaved === id) setExpandedSaved(null);
      }
    } catch {
      alert("Erro ao deletar resposta");
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">Assistente IA</h1>
          <p className="text-text-secondary text-sm mt-1">Especialista técnico em ótica — lentes, armações, patologias e mais.</p>
        </div>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="lg:hidden px-3 py-1.5 rounded-lg bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-[11px] font-bold flex items-center gap-1.5"
        >
          <Bookmark className="w-3.5 h-3.5" /> {savedCount}/{savedMax}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 min-h-0">
        {/* ════ Chat ════ */}
        <div className="flex flex-col rounded-2xl border border-border bg-bg-card overflow-hidden min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-accent-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-accent-green" />
                  </div>
                )}
                <div className={`max-w-[80%] relative group ${msg.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-accent-green/15 text-text-primary rounded-tr-sm"
                        : "bg-bg-card-hover text-text-secondary border border-border/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {/* Save button on assistant messages */}
                  {msg.role === "assistant" && i > 0 && (
                    <button
                      onClick={() => handleSaveResponse(i)}
                      disabled={savingIdx === i || savedCount >= savedMax}
                      className="absolute -bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-bg-deep border border-border hover:bg-accent-amber/10 hover:border-accent-amber/30 hover:text-accent-amber text-text-muted disabled:opacity-30"
                      title={savedCount >= savedMax ? `Limite de ${savedMax} respostas salvas` : "Salvar resposta"}
                    >
                      <Bookmark className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-accent-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-accent-teal" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-green/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-accent-green" />
                </div>
                <div className="bg-bg-card-hover border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Pergunte sobre lentes, patologias, armações, cirurgias..."
                className="flex-1 px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ════ Saved Responses Panel ════ */}
        <div className={`${showSaved ? "block" : "hidden"} lg:block`}>
          <div className="card-base rounded-2xl p-4 space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-accent-amber" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Respostas Salvas</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                savedCount >= savedMax
                  ? "bg-accent-rose/10 text-accent-rose"
                  : "bg-accent-amber/10 text-accent-amber"
              }`}>
                {savedCount}/{savedMax}
              </span>
            </div>

            {savedCount >= savedMax && (
              <div className="px-3 py-2 rounded-lg bg-accent-rose/5 border border-accent-rose/15 text-[10px] text-accent-rose">
                Limite atingido. Delete alguma para salvar novas.
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {saved.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="w-8 h-8 text-text-muted/20 mx-auto mb-2" />
                  <p className="text-[11px] text-text-muted">Nenhuma resposta salva.</p>
                  <p className="text-[10px] text-text-muted/60 mt-1">Passe o mouse sobre uma resposta do assistente e clique no ícone de salvar.</p>
                </div>
              ) : (
                saved.map((r) => (
                  <div key={r.id} className="rounded-xl bg-bg-deep border border-border/50 overflow-hidden">
                    <button
                      onClick={() => setExpandedSaved(expandedSaved === r.id ? null : r.id)}
                      className="w-full text-left px-3 py-2.5 flex items-start gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] text-text-secondary leading-relaxed ${
                          expandedSaved === r.id ? "" : "line-clamp-2"
                        }`}>
                          {r.content}
                        </p>
                        <span className="text-[9px] text-text-muted/50 mt-1 block">{formatDate(r.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        {expandedSaved === r.id ? (
                          <ChevronUp className="w-3 h-3 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-text-muted" />
                        )}
                      </div>
                    </button>
                    {expandedSaved === r.id && (
                      <div className="px-3 pb-2.5 flex justify-end">
                        <button
                          onClick={() => handleDeleteSaved(r.id)}
                          className="text-[9px] text-text-muted hover:text-accent-rose transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Deletar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
