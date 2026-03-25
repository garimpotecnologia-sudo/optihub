"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    period: "",
    description: "Para conhecer a plataforma",
    features: [
      "30 gerações/mês",
      "Criador de Artes básico",
      "Editor de Produtos (5/mês)",
      "Acesso à comunidade",
      "Templates básicos",
    ],
    cta: "Começar Grátis",
    href: "/register",
    style: "card-base rounded-2xl",
    badge: null,
    accent: "accent-emerald",
  },
  {
    name: "Pro",
    price: "R$97",
    period: "/mês",
    description: "Para óticas que querem crescer",
    features: [
      "500 gerações/mês",
      "Todas as ferramentas",
      "Try-On Virtual ilimitado",
      "Processamento em lote",
      "Assistente de Vendas",
      "Templates premium",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/dashboard/upgrade",
    style: "card-featured rounded-2xl scale-[1.03] shadow-[0_0_60px_rgba(3,255,148,0.06)]",
    badge: "Mais Popular",
    accent: "accent-green",
  },
  {
    name: "Rede",
    price: "R$247",
    period: "/mês",
    description: "Para redes de óticas",
    features: [
      "Gerações ilimitadas",
      "Múltiplos usuários",
      "API customizada",
      "White-label",
      "Dashboard por filial",
      "Gerente de conta",
      "Integração WhatsApp",
    ],
    cta: "Falar com Vendas",
    href: "https://wa.me/5500000000000",
    style: "card-base rounded-2xl",
    badge: null,
    accent: "accent-violet",
  },
];

export default function Pricing() {
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
    <section id="pricing" ref={sectionRef} className="py-28 sm:py-36 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20" data-anim="animate-scale-in">
          <span className="text-xs font-bold text-accent-green uppercase tracking-[0.2em]">
            Planos
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-[800] font-[var(--font-heading)] mt-4 mb-5 tracking-tight">
            Escolha seu plano
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
            Comece grátis e escale conforme sua ótica cresce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              data-anim={i === 1 ? "animate-scale-in" : i === 0 ? "animate-slide-left" : "animate-slide-right"}
              className={`relative p-8 ${plan.style} delay-${(i + 1) * 150}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent-green text-bg-deep text-xs font-bold tracking-wide shadow-lg shadow-accent-green/20">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-[700] font-[var(--font-heading)] tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-text-muted text-sm mt-1.5">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-[800] font-[var(--font-heading)] tracking-tight">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-text-muted text-base ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <svg className={`w-4 h-4 flex-shrink-0 ${
                      plan.accent === "accent-green" ? "text-accent-green" :
                      plan.accent === "accent-violet" ? "text-accent-violet" : "text-accent-emerald"
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`btn-press block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  plan.accent === "accent-green"
                    ? "bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep hover:shadow-[0_0_30px_rgba(3,255,148,0.2)]"
                    : plan.accent === "accent-violet"
                    ? "border border-accent-violet/30 text-text-primary hover:bg-accent-violet/10 hover:border-accent-violet/50"
                    : "border border-border-hover text-text-primary hover:border-accent-green/30 hover:text-accent-green"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
