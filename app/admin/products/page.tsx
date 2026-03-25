"use client";

import { useState, useEffect } from "react";

interface ProductSub {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  product: string;
  status: string;
  billing_type: string;
  value: number;
  next_due_date: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-accent-green/10 text-accent-green",
  PENDING: "bg-accent-amber/10 text-accent-amber",
  OVERDUE: "bg-accent-rose/10 text-accent-rose",
  CANCELLED: "bg-bg-deep text-text-muted",
};

const productLabels: Record<string, string> = {
  IA_OTICA: "IA para Ótica",
  IA_AGENDAMENTO: "IA Agendamento",
};

export default function AdminProductsPage() {
  const [subs, setSubs] = useState<ProductSub[]>([]);
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ type: "product" });
      if (productFilter) params.set("status", productFilter);
      const res = await fetch(`/api/admin/subscriptions?${params}`);
      const data = await res.json();
      setSubs(data.subscriptions || []);
      setLoading(false);
    }
    load();
  }, [productFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] tracking-tight">Produtos IA</h1>
        <p className="text-text-muted text-sm mt-1">Assinaturas de IA para Ótica e IA Agendamento.</p>
      </div>

      <div className="flex gap-2">
        {["", "ACTIVE", "PENDING", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setProductFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              productFilter === s ? "bg-accent-violet/15 text-accent-violet border border-accent-violet/20" : "bg-bg-card border border-border text-text-muted"
            }`}>
            {s || "Todos"}
          </button>
        ))}
      </div>

      <div className="card-base rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Usuário</th>
              <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Produto</th>
              <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Valor</th>
              <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={5} className="px-5 py-4"><div className="h-4 w-full rounded bg-bg-card-hover animate-pulse" /></td></tr>
              ))
            ) : subs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-text-muted">Nenhuma assinatura de produto encontrada</td></tr>
            ) : subs.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-bg-card-hover/50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium">{s.user_name}</p>
                  <p className="text-[11px] text-text-muted">{s.user_email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-bold text-accent-violet">{productLabels[s.product] || s.product}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${statusColors[s.status] || "bg-bg-deep text-text-muted"}`}>{s.status}</span>
                </td>
                <td className="px-5 py-3.5 text-sm">R$ {Number(s.value).toFixed(2)}</td>
                <td className="px-5 py-3.5 text-xs text-text-muted">{s.billing_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
