"use client";

import { useEffect, useRef } from "react";

const creations = [
  { title: "Promoção Dia das Mães", optica: "Ótica Visão Premium", tool: "Criador de Artes", likes: 47, ratio: "4/5" },
  { title: "Try-On Ray-Ban Aviator", optica: "Ótica Central", tool: "Try-On Virtual", likes: 32, ratio: "1/1" },
  { title: "Catálogo Verão 2025", optica: "Ótica Style", tool: "Editor de Produtos", likes: 58, ratio: "4/5" },
  { title: "Post Lançamento Oakley", optica: "Mega Ótica", tool: "Criador de Artes", likes: 41, ratio: "1/1" },
  { title: "Story Black Friday", optica: "Ótica Moderna", tool: "Criador de Artes", likes: 63, ratio: "9/16" },
  { title: "Composição Vitrine", optica: "Ótica Premium SP", tool: "Editor de Produtos", likes: 29, ratio: "4/5" },
];

const toolColor: Record<string, string> = {
  "Criador de Artes": "text-accent-green bg-accent-green/10",
  "Try-On Virtual": "text-accent-teal bg-accent-teal/10",
  "Editor de Produtos": "text-accent-violet bg-accent-violet/10",
};

export default function CommunitySection() {
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
      { threshold: 0.05 }
    );

    const els = sectionRef.current?.querySelectorAll("[data-anim]");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="comunidade"
      ref={sectionRef}
      className="py-28 sm:py-36 px-4 relative"
    >
      {/* Section gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-elevated/50 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16" data-anim="animate-scale-in">
          <span className="text-xs font-bold text-accent-teal uppercase tracking-[0.2em]">
            Comunidade
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-[800] font-[var(--font-heading)] mt-4 mb-5 tracking-tight">
            Criado por óticas reais
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto text-lg leading-relaxed">
            Inspire-se e compartilhe suas criações.
          </p>
        </div>

        {/* Masonry grid with varying sizes */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {creations.map((item, i) => (
            <div
              key={i}
              data-anim="animate-scale-in"
              className={`break-inside-avoid card-base rounded-2xl overflow-hidden delay-${((i % 3) + 1) * 100}`}
            >
              {/* Image placeholder — varied aspect ratios */}
              <div
                className="bg-gradient-to-br from-bg-card-hover to-bg-surface flex items-center justify-center"
                style={{ aspectRatio: item.ratio }}
              >
                <svg className="w-12 h-12 text-text-muted/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                </svg>
              </div>
              <div className="p-5">
                <h4 className="font-[600] text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-text-muted mb-3">{item.optica}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${toolColor[item.tool] || "text-text-muted bg-bg-surface"}`}>
                    {item.tool}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-accent-rose" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    {item.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
