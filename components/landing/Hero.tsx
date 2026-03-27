"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

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
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      {/* Background grid — parallax */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(3,255,148,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(3,255,148,0.4) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      />

      {/* Ambient glow blobs — varied animations */}
      <div className="absolute top-[20%] -left-40 w-[600px] h-[600px] rounded-full bg-accent-green/8 blur-[180px] animate-glow-pulse" />
      <div className="absolute bottom-[15%] -right-40 w-[500px] h-[500px] rounded-full bg-accent-teal/8 blur-[160px] animate-float-slow" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-accent-violet/5 blur-[120px] animate-float-fast" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div
          data-anim="animate-scale-in"
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-accent-green/15 bg-accent-green/5 backdrop-blur-sm mb-10"
        >
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-medium tracking-wide text-accent-green/90">
            Powered by AgentPRO
          </span>
        </div>

        {/* Headline — dramatic size + weight */}
        <h1
          data-anim="animate-fade-up"
          className="text-5xl sm:text-6xl md:text-8xl lg:text-[6.5rem] font-[800] font-[var(--font-heading)] leading-[0.95] tracking-tight mb-7 delay-100"
        >
          IA que{" "}
          <span className="text-shimmer">
            transforma
          </span>
          <br />
          sua ótica
        </h1>

        {/* Sub-headline — lighter weight, wider */}
        <p
          data-anim="animate-fade-up"
          className="text-lg sm:text-xl md:text-2xl font-[300] text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed tracking-wide delay-200"
        >
          Crie artes profissionais, edite produtos, experimente armações
          virtualmente e venda mais — tudo com inteligência artificial.
        </p>

        {/* CTAs — differentiated styles */}
        <div
          data-anim="animate-fade-up"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 delay-300"
        >
          <Link
            href="/register"
            className="btn-press group w-full sm:w-auto px-10 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep hover:shadow-[0_0_40px_rgba(3,255,148,0.25)] transition-all duration-300"
          >
            Criar Conta Grátis
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#ferramentas"
            className="btn-press w-full sm:w-auto px-10 py-4 text-base font-medium rounded-xl border border-border-hover text-text-primary hover:border-accent-green/25 hover:bg-accent-green/5 transition-all duration-300"
          >
            Ver Ferramentas
          </a>
        </div>

        {/* Stats — bolder numbers */}
        <div
          data-anim="animate-fade-up"
          className="mt-20 flex flex-wrap items-center justify-center gap-12 sm:gap-20 delay-500"
        >
          {[
            { value: "500+", label: "Óticas ativas" },
            { value: "12k+", label: "Criações/mês" },
            { value: "200+", label: "Templates" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl sm:text-5xl font-[800] font-[var(--font-heading)] tracking-tight ${
                i === 0 ? "text-accent-green" : i === 1 ? "text-accent-teal" : "text-accent-emerald"
              }`}>
                {stat.value}
              </div>
              <div className="text-sm text-text-muted mt-2 tracking-wide font-medium uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
