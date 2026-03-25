"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  role: string;
  credits: number;
  subscription_status: string | null;
  created_at: string;
}

const planColors: Record<string, string> = {
  STARTER: "text-text-muted",
  PRO: "text-accent-green",
  REDE: "text-accent-violet",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, planFilter]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] tracking-tight">Usuários</h1>
          <p className="text-text-muted text-sm mt-1">{total} usuários registrados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="input-glow flex-1 px-4 py-2.5 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-bg-deep border border-border text-text-primary text-sm focus:outline-none"
        >
          <option value="">Todos os planos</option>
          <option value="STARTER">Starter</option>
          <option value="PRO">Pro</option>
          <option value="REDE">Rede</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-base rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Nome</th>
                <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Plano</th>
                <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-[11px] text-text-muted font-medium uppercase tracking-wider px-5 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={5} className="px-5 py-4"><div className="h-4 w-full rounded bg-bg-card-hover animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-text-muted">Nenhum usuário encontrado</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-bg-card-hover/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/users/${u.id}`} className="text-sm font-medium hover:text-accent-violet transition-colors">
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${planColors[u.plan] || "text-text-muted"}`}>{u.plan}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        u.role === "admin" ? "bg-accent-violet/10 text-accent-violet" : "bg-bg-deep text-text-muted"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
