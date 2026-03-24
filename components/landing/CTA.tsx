"use client";

import { useState, useEffect, useRef } from "react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-28 sm:py-44 px-4 relative overflow-hidden"
    >
      {/* Dramatic background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-accent-green/6 blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent-teal/5 blur-[120px] animate-float-slow" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div data-anim="animate-scale-in">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-[800] font-[var(--font-heading)] mb-5 tracking-tight leading-[0.95]">
            Pronto para
            <br />
            <span className="text-shimmer">transformar</span> sua ótica?
          </h2>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed">
            Entre na waitlist e seja um dos primeiros a usar o ÓptiHub.
          </p>
        </div>

        {submitted ? (
          <div
            data-anim="animate-scale-in"
            className="p-6 rounded-2xl card-featured"
          >
            <div className="text-3xl mb-3">✓</div>
            <p className="text-accent-green font-bold text-lg">
              Você está na lista!
            </p>
            <p className="text-text-secondary text-sm mt-1">Vamos te avisar quando abrir.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            data-anim="animate-fade-up"
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto delay-200"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="input-glow flex-1 px-5 py-4 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-sm"
            />
            <button
              type="submit"
              className="btn-press px-8 py-4 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all"
            >
              Entrar na Waitlist
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
