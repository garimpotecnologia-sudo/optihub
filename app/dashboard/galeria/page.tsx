"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type Tool = "TODOS" | "CRIADOR" | "EDITOR" | "TRYON" | "ASSISTENTE" | "FACEPOST" | "CARROSSEL";

interface GalleryItem {
  id: string;
  tool: string;
  prompt: string;
  image_url: string;
  metadata: { tipo?: string; estilo?: string; ratio?: string } | null;
  created_at: string;
}

const toolTabs: { id: Tool; label: string; color: string }[] = [
  { id: "TODOS", label: "Todos", color: "accent-green" },
  { id: "CRIADOR", label: "Criador de Artes", color: "accent-green" },
  { id: "EDITOR", label: "Editor de Produtos", color: "accent-violet" },
  { id: "TRYON", label: "Try-On Virtual", color: "accent-teal" },
  { id: "ASSISTENTE", label: "Assistente", color: "accent-amber" },
  { id: "FACEPOST", label: "FacePost", color: "accent-rose" },
  { id: "CARROSSEL", label: "Carrossel", color: "accent-amber" },
];

const toolBadge: Record<string, string> = {
  CRIADOR: "text-accent-green bg-accent-green/10",
  EDITOR: "text-accent-violet bg-accent-violet/10",
  TRYON: "text-accent-teal bg-accent-teal/10",
  ASSISTENTE: "text-accent-amber bg-accent-amber/10",
  FACEPOST: "text-accent-rose bg-accent-rose/10",
  CARROSSEL: "text-accent-amber bg-accent-amber/10",
};

const toolLabel: Record<string, string> = {
  CRIADOR: "Criador de Artes",
  EDITOR: "Editor de Produtos",
  TRYON: "Try-On Virtual",
  ASSISTENTE: "Assistente",
  FACEPOST: "FacePost",
  CARROSSEL: "Carrossel",
};

export default function GaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tool>("TODOS");
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadGallery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadGallery() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("generations")
      .select("id, tool, prompt, image_url, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setItems(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from("generations").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleting(null);
  }

  const filtered = tab === "TODOS" ? items : items.filter((i) => i.tool === tab);

  const counts: Record<string, number> = { TODOS: items.length };
  items.forEach((i) => { counts[i.tool] = (counts[i.tool] || 0) + 1; });

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">
          Minha Galeria
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Todas as suas criações salvas, organizadas por ferramenta.
        </p>
      </div>

      {/* 30-day warning */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-amber/5 border border-accent-amber/15">
        <svg className="w-4 h-4 text-accent-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-[11px] text-text-muted">
          <span className="font-semibold text-accent-amber">Aviso:</span> As imagens ficam disponíveis na galeria por <span className="font-semibold text-text-primary">30 dias</span>. Faça o download para seu dispositivo antes do prazo.
        </p>
      </div>

      {/* Tabs por ferramenta */}
      <div className="flex flex-wrap gap-2">
        {toolTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn-press flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              tab === t.id
                ? `bg-${t.color}/20 text-${t.color} border border-${t.color}/30`
                : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary hover:border-border-hover"
            }`}
          >
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              tab === t.id ? `bg-${t.color}/20` : "bg-bg-card"
            }`}>
              {counts[t.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl card-base overflow-hidden animate-pulse">
              <div className="aspect-square bg-bg-card-hover" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 rounded bg-bg-card-hover" />
                <div className="h-3 w-1/2 rounded bg-bg-card-hover" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <svg className="w-16 h-16 mx-auto text-text-muted/15 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
          </svg>
          <p className="text-text-muted text-sm">
            {tab === "TODOS"
              ? "Nenhuma criação salva ainda. Gere artes e salve na galeria."
              : `Nenhuma criação de ${toolLabel[tab]} salva.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-2xl card-base overflow-hidden group">
              {/* Image */}
              <div className="relative aspect-square bg-bg-card-hover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.prompt.slice(0, 50)} loading="lazy" className="w-full h-full object-cover" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-bg-deep/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  <a
                    href={item.image_url}
                    download
                    target="_blank"
                    className="btn-press w-full py-2.5 rounded-lg text-xs font-bold bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors text-center"
                  >
                    Download HD
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="btn-press w-full py-2.5 rounded-lg text-xs font-medium border border-accent-rose/20 text-accent-rose/70 hover:bg-accent-rose/10 hover:text-accent-rose transition-colors"
                  >
                    {deleting === item.id ? "Removendo..." : "Remover da galeria"}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${toolBadge[item.tool] || "text-text-muted bg-bg-surface"}`}>
                    {toolLabel[item.tool] || item.tool}
                  </span>
                  <span className="text-[10px] text-text-muted">{timeAgo(item.created_at)}</span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {item.prompt.slice(0, 100)}{item.prompt.length > 100 ? "..." : ""}
                </p>
                {item.metadata?.estilo && (
                  <span className="inline-block text-[10px] text-text-muted bg-bg-deep px-2 py-0.5 rounded">
                    {item.metadata.estilo}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
