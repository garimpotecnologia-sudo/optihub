"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";

interface RecentGeneration {
  id: string;
  tool: string;
  prompt: string;
  created_at: string;
}

const quickActions = [
  { title: "Criar Arte", description: "Gere posts, stories e banners com IA", href: "/dashboard/criar", gradient: "from-accent-green/20 to-accent-teal/20", border: "border-accent-green/20" },
  { title: "Editar Produto", description: "Remova fundo, mude cenário, ajuste iluminação", href: "/dashboard/editor", gradient: "from-accent-violet/20 to-accent-rose/20", border: "border-accent-violet/20" },
  { title: "Try-On Virtual", description: "Experimente armações virtualmente", href: "/dashboard/tryon", gradient: "from-accent-teal/20 to-accent-violet/20", border: "border-accent-teal/20" },
  { title: "Assistente", description: "Chat inteligente para vendas", href: "/dashboard/assistente", gradient: "from-accent-amber/20 to-accent-green/20", border: "border-accent-amber/20" },
];

const toolLabels: Record<string, string> = {
  CRIADOR: "Criador de Artes",
  TRYON: "Try-On Virtual",
  EDITOR: "Editor de Produtos",
  ASSISTENTE: "Assistente",
};

export default function DashboardPage() {
  const { profile, loading, planLimit, supabase } = useProfile();
  const [recent, setRecent] = useState<RecentGeneration[]>([]);

  useEffect(() => {
    async function loadRecent() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("generations")
        .select("id, tool, prompt, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setRecent(data);
    }
    loadRecent();
  }, [supabase]);

  const usage = profile?.monthlyUsage || 0;

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Há ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-bg-card-hover" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-[16px] bg-bg-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Olá, {profile?.name?.split(" ")[0] || "Usuário"} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">Aqui está o resumo da sua ótica hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gerações este mês", value: `${usage}`, limit: `/${planLimit === 999999 ? "∞" : planLimit}`, icon: "🎨" },
          { label: "Plano atual", value: profile?.plan || "STARTER", limit: "", icon: "⭐" },
          { label: "Criações salvas", value: `${recent.length}+`, limit: "", icon: "💾" },
          { label: "Créditos restantes", value: `${planLimit === 999999 ? "∞" : planLimit - usage}`, limit: "", icon: "🔋" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-[16px] border border-border bg-bg-card">
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold font-[var(--font-heading)] mt-2">
              {stat.value}<span className="text-text-muted text-base font-normal">{stat.limit}</span>
            </div>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className={`group relative p-6 rounded-[16px] border ${action.border} bg-bg-card hover:bg-bg-card-hover transition-all duration-300`}>
              <div className={`absolute inset-0 rounded-[16px] bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <h3 className="text-base font-bold font-[var(--font-heading)] mb-1">{action.title}</h3>
                <p className="text-sm text-text-secondary">{action.description}</p>
                <span className="inline-flex items-center mt-3 text-xs font-medium text-accent-green">Abrir →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">Atividade Recente</h2>
          <div className="rounded-[16px] border border-border bg-bg-card overflow-hidden">
            {recent.map((item, i) => (
              <div key={item.id} className={`flex items-center justify-between p-4 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-sm font-medium truncate max-w-md">{item.prompt.slice(0, 60)}...</p>
                  <p className="text-xs text-text-muted">{toolLabels[item.tool] || item.tool}</p>
                </div>
                <span className="text-xs text-text-muted">{timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
