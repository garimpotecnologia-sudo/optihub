"use client";

import { useEffect, useRef } from "react";

const tools = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Criador de Artes",
    description: "Gere posts, stories, banners e catálogos profissionais. Só descrever o que quer.",
    tags: ["Instagram", "Stories", "Banner", "Catálogo"],
    color: "accent-green",
    style: "card-featured",
    anim: "animate-slide-left",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Try-On Virtual",
    description: "Cliente experimenta armações. Envie selfie e compartilhe via WhatsApp.",
    tags: ["Selfie", "Armações", "WhatsApp"],
    color: "accent-teal",
    style: "card-base",
    anim: "animate-slide-right",
    span: "",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "Editor de Produtos",
    description: "Remova fundos, ajuste iluminação, cenários profissionais. Em lote.",
    tags: ["Background", "Iluminação", "Cenário"],
    color: "accent-violet",
    style: "card-base",
    anim: "animate-fade-up",
    span: "",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Assistente de Vendas",
    description: "Chat que conhece suas marcas. Recomenda armações e ajuda no atendimento.",
    tags: ["Chat", "Recomendações"],
    color: "accent-amber",
    style: "card-inset",
    anim: "animate-slide-left",
    span: "md:col-span-2",
  },
];

const colorMap: Record<string, string> = {
  "accent-green": "text-accent-green bg-accent-green/10 border-accent-green/20",
  "accent-teal": "text-accent-teal bg-accent-teal/10 border-accent-teal/20",
  "accent-violet": "text-accent-violet bg-accent-violet/10 border-accent-violet/20",
  "accent-amber": "text-accent-amber bg-accent-amber/10 border-accent-amber/20",
};

const iconBg: Record<string, string> = {
  "accent-green": "bg-accent-green/10 text-accent-green",
  "accent-teal": "bg-accent-teal/10 text-accent-teal",
  "accent-violet": "bg-accent-violet/10 text-accent-violet",
  "accent-amber": "bg-accent-amber/10 text-accent-amber",
};

export default function Tools() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              entry.target.getAttribute("data-anim") || "animate-fade-up"
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = sectionRef.current?.querySelectorAll("[data-anim]");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ferramentas"
      ref={sectionRef}
      className="py-28 sm:py-36 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20" data-anim="animate-fade-up">
          <span className="text-xs font-bold text-accent-green uppercase tracking-[0.2em]">
            Ferramentas
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-[800] font-[var(--font-heading)] mt-4 mb-5 tracking-tight">
            Tudo que sua ótica precisa
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto text-lg leading-relaxed">
            4 ferramentas de IA integradas em uma única plataforma.
          </p>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tools.map((tool, i) => (
            <div
              key={tool.title}
              data-anim={tool.anim}
              className={`${tool.style} group relative p-7 sm:p-8 rounded-2xl cursor-pointer ${tool.span} delay-${(i + 1) * 100}`}
            >
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${iconBg[tool.color]} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                  {tool.icon}
                </div>

                <h3 className="text-xl font-[700] font-[var(--font-heading)] mb-3 tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-5">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md border ${colorMap[tool.color]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
