"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";

export default function ConfigPage() {
  const { profile, loading, planLimit, supabase } = useProfile();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [opticaData, setOpticaData] = useState({
    optica_name: "",
    optica_address: "",
    optica_brands: "",
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });

  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (profile) {
      setOpticaData({
        optica_name: profile.optica_name || "",
        optica_address: profile.optica_address || "",
        optica_brands: profile.optica_brands?.join(", ") || "",
      });
      setUserData({
        name: profile.name || "",
        email: profile.email || "",
      });
      setApiKey(profile.custom_api_key || "");
    }
  }, [profile]);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const usage = profile?.monthlyUsage || 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-48 rounded-[16px] bg-bg-card" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Configurações</h1>
        <p className="text-text-secondary text-sm mt-1">Gerencie os dados da sua ótica e conta.</p>
      </div>

      {saved && (
        <div className="p-3 rounded-[10px] bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm text-center">
          Salvo com sucesso!
        </div>
      )}

      {/* Ótica */}
      <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Dados da Ótica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome da Ótica</label>
            <input type="text" value={opticaData.optica_name} onChange={(e) => setOpticaData(p => ({ ...p, optica_name: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Endereço</label>
            <input type="text" value={opticaData.optica_address} onChange={(e) => setOpticaData(p => ({ ...p, optica_address: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Marcas (separadas por vírgula)</label>
          <input type="text" value={opticaData.optica_brands} onChange={(e) => setOpticaData(p => ({ ...p, optica_brands: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
        </div>
        <button disabled={saving} onClick={() => handleSave({ optica_name: opticaData.optica_name, optica_address: opticaData.optica_address, optica_brands: opticaData.optica_brands.split(",").map(b => b.trim()).filter(Boolean) })} className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>

      {/* User */}
      <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Dados do Usuário</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome</label>
            <input type="text" value={userData.name} onChange={(e) => setUserData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input type="email" value={userData.email} disabled className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-muted text-sm cursor-not-allowed" />
          </div>
        </div>
        <button disabled={saving} onClick={() => handleSave({ name: userData.name })} className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-50">
          Atualizar Dados
        </button>
      </div>

      {/* Plan */}
      <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Plano Atual</h2>
        <div className="flex items-center justify-between p-4 rounded-[12px] bg-bg-deep border border-border">
          <div>
            <span className="text-sm font-bold">{profile?.plan}</span>
            <span className="text-xs text-text-muted ml-2">{profile?.plan === "STARTER" ? "Grátis" : profile?.plan === "PRO" ? "R$97/mês" : "R$247/mês"}</span>
            <p className="text-xs text-text-muted mt-1">{usage} de {planLimit === 999999 ? "∞" : planLimit} gerações usadas este mês</p>
          </div>
          {profile?.plan === "STARTER" ? (
            <Link href="/dashboard/upgrade" className="px-4 py-2 rounded-[10px] bg-accent-green/10 text-accent-green text-sm font-medium hover:bg-accent-green/20 transition-colors">
              Upgrade para Pro
            </Link>
          ) : (
            <Link href="/dashboard/billing" className="px-4 py-2 rounded-[10px] bg-accent-green/10 text-accent-green text-sm font-medium hover:bg-accent-green/20 transition-colors">
              Gerenciar Assinatura
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-bg-deep overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-teal" style={{ width: `${planLimit ? Math.min((usage / planLimit) * 100, 100) : 0}%` }} />
          </div>
          <span className="text-sm text-text-muted">{usage}/{planLimit === 999999 ? "∞" : planLimit}</span>
        </div>
      </div>

      {/* API Key */}
      <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
        <h2 className="text-lg font-bold font-[var(--font-heading)]">API Key Customizada</h2>
        <p className="text-sm text-text-muted">Opcional: use sua própria chave da Google Gemini.</p>
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..." className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm font-mono" />
        <button disabled={saving} onClick={() => handleSave({ custom_api_key: apiKey })} className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-50">
          Salvar Key
        </button>
      </div>
    </div>
  );
}
