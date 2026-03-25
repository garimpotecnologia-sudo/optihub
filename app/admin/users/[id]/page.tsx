"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: string;
  role: string;
  credits: number;
  optica_name: string | null;
  subscription_status: string | null;
  created_at: string;
}

interface Generation {
  id: string;
  tool: string;
  prompt: string;
  created_at: string;
}

const toolLabels: Record<string, string> = {
  CRIADOR: "Criador de Artes",
  TRYON: "Try-On Virtual",
  EDITOR: "Editor de Produtos",
  ASSISTENTE: "Assistente",
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCredits, setEditCredits] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setEditName(data.profile.name);
        setEditPlan(data.profile.plan);
        setEditRole(data.profile.role);
        setEditCredits(data.profile.credits);
      }
      setGenerations(data.recentGenerations || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, plan: editPlan, role: editRole, credits: editCredits }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto space-y-4 animate-pulse"><div className="h-10 w-48 rounded-lg bg-bg-card-hover" /><div className="h-64 rounded-2xl bg-bg-card" /></div>;
  }

  if (!profile) return <p className="text-text-muted">Usuário não encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/users" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] tracking-tight">{profile.name}</h1>
          <p className="text-text-muted text-sm">{profile.email}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-press px-5 py-2.5 rounded-xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet text-xs font-bold hover:bg-accent-violet/20 transition-colors disabled:opacity-40"
        >
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
        </button>
      </div>

      {/* Edit form */}
      <div className="card-base rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5 uppercase tracking-wider">Nome</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              className="input-glow w-full px-4 py-2.5 rounded-xl bg-bg-deep border border-border text-text-primary text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5 uppercase tracking-wider">Plano</label>
            <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-deep border border-border text-text-primary text-sm focus:outline-none">
              <option value="STARTER">STARTER</option>
              <option value="PRO">PRO</option>
              <option value="REDE">REDE</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5 uppercase tracking-wider">Role</label>
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-deep border border-border text-text-primary text-sm focus:outline-none">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5 uppercase tracking-wider">Créditos</label>
            <input type="number" value={editCredits} onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
              className="input-glow w-full px-4 py-2.5 rounded-xl bg-bg-deep border border-border text-text-primary text-sm focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-4 text-xs text-text-muted pt-2">
          <span>Ótica: {profile.optica_name || "—"}</span>
          <span>Criado: {new Date(profile.created_at).toLocaleDateString("pt-BR")}</span>
          <span>Status assinatura: {profile.subscription_status || "—"}</span>
        </div>
      </div>

      {/* Recent generations */}
      {generations.length > 0 && (
        <div className="card-base rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold font-[var(--font-heading)]">Gerações Recentes</h2>
          <div className="divide-y divide-border">
            {generations.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm truncate max-w-md">{g.prompt.slice(0, 60)}...</p>
                  <p className="text-[11px] text-text-muted">{toolLabels[g.tool] || g.tool}</p>
                </div>
                <span className="text-[11px] text-text-muted shrink-0">{new Date(g.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
