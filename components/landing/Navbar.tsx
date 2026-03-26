"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        const total = document.body.scrollHeight - window.innerHeight;
        setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-bg-deep/70 backdrop-blur-2xl border-b border-border shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-teal to-accent-green flex items-center justify-center shadow-lg shadow-accent-green/10 transition-transform group-hover:scale-110">
                <span className="text-bg-deep font-[800] text-sm font-[var(--font-heading)]">
                  O
                </span>
              </div>
              <span className="text-lg font-[700] font-[var(--font-heading)] text-text-primary tracking-tight">
                Ópti<span className="text-accent-green">Hub</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { href: "#ferramentas", label: "Ferramentas" },
                { href: "#como-funciona", label: "Como Funciona" },
                { href: "#comunidade", label: "Comunidade" },
                { href: "#pricing", label: "Planos" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="link-slide text-sm font-medium text-text-secondary hover:text-accent-green transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-press px-5 py-2.5 text-sm font-bold rounded-lg bg-accent-green text-bg-deep hover:bg-accent-green/90 hover:shadow-lg hover:shadow-accent-green/15 transition-all duration-300"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
