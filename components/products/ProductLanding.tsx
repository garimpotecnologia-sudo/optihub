"use client";

import type { ProductKey } from "@/lib/products";
import { PRODUCTS } from "@/lib/products";

interface ProductLandingProps {
  product: ProductKey;
  onSubscribe: () => void;
}

export default function ProductLanding({ product, onSubscribe }: ProductLandingProps) {
  const p = PRODUCTS[product];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-xs font-medium text-accent-green">
          Novo Produto
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          {p.name}
        </h1>
        <p className="text-text-muted text-sm max-w-md mx-auto">{p.description}</p>
      </div>

      <div className="card-featured rounded-2xl p-8 space-y-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-[var(--font-heading)] text-gradient-brand">
            R$ {p.price}
          </span>
          <span className="text-text-muted text-sm">/mês</span>
        </div>

        <ul className="space-y-3">
          {p.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent-green shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-text-secondary">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onSubscribe}
          className="btn-press btn-primary w-full py-4 rounded-xl text-bg-deep font-bold text-sm"
        >
          Contratar {p.name}
        </button>
      </div>
    </div>
  );
}
