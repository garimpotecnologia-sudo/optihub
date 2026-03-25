"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalUsers: number;
  byPlan: { STARTER: number; PRO: number; REDE: number };
  monthlyGenerations: number;
  activeMainSubs: number;
  activeProductSubs: number;
  revenue: { main: number; products: number; total: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-bg-card-hover" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-2xl bg-bg-card" />)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Usuários", value: stats.totalUsers, color: "accent-violet" },
    { label: "Gerações / Mês", value: stats.monthlyGenerations, color: "accent-green" },
    { label: "Assinaturas Plano", value: stats.activeMainSubs, color: "accent-teal" },
    { label: "Assinaturas Produtos", value: stats.activeProductSubs, color: "accent-amber" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] tracking-tight">Dashboard Admin</h1>
        <p className="text-text-muted text-sm mt-1">Visão geral da plataforma.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card-base rounded-2xl p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">{card.label}</p>
            <p className={`text-3xl font-bold font-[var(--font-heading)] mt-2 text-${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-featured rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold font-[var(--font-heading)]">Receita Mensal Recorrente</h2>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-[var(--font-heading)] text-gradient-brand">
              R$ {stats.revenue.total.toFixed(2)}
            </span>
            <span className="text-text-muted text-sm">/mês</span>
          </div>
          <div className="flex gap-4 text-xs text-text-muted">
            <span>Planos: R$ {stats.revenue.main.toFixed(2)}</span>
            <span>Produtos: R$ {stats.revenue.products.toFixed(2)}</span>
          </div>
        </div>

        <div className="card-base rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold font-[var(--font-heading)]">Distribuição de Planos</h2>
          <div className="space-y-3">
            {(["STARTER", "PRO", "REDE"] as const).map((plan) => {
              const count = stats.byPlan[plan];
              const pct = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
              return (
                <div key={plan} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-16">{plan}</span>
                  <div className="flex-1 h-2 rounded-full bg-bg-deep overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-teal" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-muted w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
