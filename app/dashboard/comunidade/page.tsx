"use client";

import { useState } from "react";

type FilterType = "recentes" | "populares" | "criador" | "editor" | "tryon";

const mockPosts = [
  {
    id: "1",
    image: null,
    title: "Promoção Dia das Mães",
    optica: "Ótica Visão Premium",
    prompt: "Post para instagram promoção dia das mães, óculos femininos elegantes, tons rosa e dourado",
    tool: "Criador de Artes",
    likes: 47,
    liked: false,
  },
  {
    id: "2",
    image: null,
    title: "Try-On Ray-Ban Aviator",
    optica: "Ótica Central",
    prompt: "Virtual try-on com Ray-Ban Aviator dourado",
    tool: "Try-On Virtual",
    likes: 32,
    liked: true,
  },
  {
    id: "3",
    image: null,
    title: "Catálogo Verão 2025",
    optica: "Ótica Style",
    prompt: "Banner catálogo de verão com óculos de sol, praia ao fundo, tipografia moderna",
    tool: "Criador de Artes",
    likes: 58,
    liked: false,
  },
  {
    id: "4",
    image: null,
    title: "Produto em Cenário Lifestyle",
    optica: "Mega Ótica",
    prompt: "Óculos Oakley em cenário lifestyle urbano, fotografia profissional",
    tool: "Editor de Produtos",
    likes: 41,
    liked: false,
  },
  {
    id: "5",
    image: null,
    title: "Story Black Friday",
    optica: "Ótica Moderna",
    prompt: "Story para instagram black friday ótica, descontos em armações, fundo preto com dourado",
    tool: "Criador de Artes",
    likes: 63,
    liked: true,
  },
  {
    id: "6",
    image: null,
    title: "Composição Vitrine",
    optica: "Ótica Premium SP",
    prompt: "Composição de vitrine premium com 4 armações de grife",
    tool: "Editor de Produtos",
    likes: 29,
    liked: false,
  },
];

const templates = [
  {
    id: "t1",
    title: "Promoção de Dia das Mães",
    prompt: "Crie um post para Instagram promovendo óculos femininos com desconto especial para Dia das Mães. Tons de rosa, dourado e branco. Tipografia elegante.",
    category: "Datas Comemorativas",
    uses: 234,
  },
  {
    id: "t2",
    title: "Lançamento de Coleção",
    prompt: "Banner de lançamento de nova coleção de armações. Design moderno e sofisticado com fundo escuro e destaques em dourado.",
    category: "Lançamento",
    uses: 189,
  },
  {
    id: "t3",
    title: "Oferta Relâmpago",
    prompt: "Story urgente de oferta relâmpago com timer visual. Armações com até 50% OFF. Cores vibrantes com vermelho e amarelo.",
    category: "Promoção",
    uses: 312,
  },
  {
    id: "t4",
    title: "Post Institucional",
    prompt: "Post institucional mostrando a fachada e equipe da ótica. Design clean e profissional com as cores da marca.",
    category: "Institucional",
    uses: 145,
  },
];

export default function ComunidadePage() {
  const [filter, setFilter] = useState<FilterType>("recentes");
  const [tab, setTab] = useState<"feed" | "templates">("feed");

  const filters: { id: FilterType; label: string }[] = [
    { id: "recentes", label: "Mais Recentes" },
    { id: "populares", label: "Mais Curtidos" },
    { id: "criador", label: "Criador" },
    { id: "editor", label: "Editor" },
    { id: "tryon", label: "Try-On" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Comunidade
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Inspire-se com criações de outras óticas e compartilhe as suas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-[10px] bg-bg-card border border-border w-fit">
        <button
          onClick={() => setTab("feed")}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all ${
            tab === "feed"
              ? "bg-accent-green/20 text-accent-green"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setTab("templates")}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all ${
            tab === "templates"
              ? "bg-accent-green/20 text-accent-green"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Templates
        </button>
      </div>

      {tab === "feed" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                  filter === f.id
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-bg-card border border-border text-text-muted hover:text-text-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed grid - masonry style */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {mockPosts.map((post) => (
              <div
                key={post.id}
                className="break-inside-avoid rounded-[16px] border border-border bg-bg-card overflow-hidden hover:border-border-hover transition-colors"
              >
                {/* Image placeholder */}
                <div
                  className="bg-gradient-to-br from-bg-card-hover to-bg-surface flex items-center justify-center"
                  style={{
                    aspectRatio:
                      post.tool === "Try-On Virtual" ? "1/1" : "4/5",
                  }}
                >
                  <div className="text-5xl opacity-15">
                    {post.tool.includes("Try") ? "👓" : "🎨"}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm">{post.title}</h4>
                    <p className="text-xs text-text-muted">{post.optica}</p>
                  </div>

                  <p className="text-xs text-text-muted italic line-clamp-2">
                    &quot;{post.prompt}&quot;
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-[6px] bg-accent-green/10 text-accent-green">
                      {post.tool}
                    </span>
                    <button
                      className={`flex items-center gap-1 text-xs ${
                        post.liked
                          ? "text-accent-rose"
                          : "text-text-muted hover:text-accent-rose"
                      } transition-colors`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill={post.liked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {post.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "templates" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-[16px] border border-border bg-bg-card p-5 hover:bg-bg-card-hover transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs px-2 py-0.5 rounded-[6px] bg-accent-violet/10 text-accent-violet">
                  {tpl.category}
                </span>
                <span className="text-xs text-text-muted">
                  {tpl.uses} usos
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-2">{tpl.title}</h3>
              <p className="text-xs text-text-muted mb-4 line-clamp-3">
                {tpl.prompt}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-[8px] text-xs font-medium bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors">
                  Usar Template
                </button>
                <button className="px-3 py-2 rounded-[8px] text-xs font-medium border border-border text-text-muted hover:text-accent-amber hover:border-accent-amber/30 transition-colors">
                  ⭐
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
