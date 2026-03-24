"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente e configure o perfil da sua ótica em menos de 2 minutos.",
    color: "accent-green",
  },
  {
    number: "02",
    title: "Escolha a ferramenta",
    description: "Selecione entre Criador de Artes, Try-On Virtual, Editor de Produtos ou Assistente.",
    color: "accent-teal",
  },
  {
    number: "03",
    title: "Gere e publique",
    description: "Descreva o que precisa, a IA cria em segundos. Baixe ou publique direto nas redes.",
    color: "accent-emerald",
  },
];

export default function HowItWorks() {
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
      id="como-funciona"
      ref={sectionRef}
      className="py-24 sm:py-32 px-4 relative"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-green/[0.02] to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-20" data-anim="animate-scale-in">
          <span className="text-xs font-bold text-accent-teal uppercase tracking-[0.2em]">
            Como Funciona
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-[800] font-[var(--font-heading)] mt-4 mb-5 tracking-tight">
            Simples como deve ser
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
            Em 3 passos você cria conteúdo profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              data-anim={i % 2 === 0 ? "animate-slide-left" : "animate-slide-right"}
              className={`relative p-8 rounded-2xl card-base delay-${(i + 1) * 150}`}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-accent-green/30 to-transparent" />
              )}

              {/* Step number — large, faded */}
              <div className={`text-7xl font-[800] font-[var(--font-heading)] leading-none mb-4 ${
                step.color === "accent-green" ? "text-accent-green/10" :
                step.color === "accent-teal" ? "text-accent-teal/10" : "text-accent-emerald/10"
              }`}>
                {step.number}
              </div>

              <h3 className="text-lg font-[700] font-[var(--font-heading)] mb-3 tracking-tight">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
