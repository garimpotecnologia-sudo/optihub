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
  {
    title: "Criar Arte",
    description: "Gere posts, stories e banners com IA",
    href: "/dashboard/criar",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    color: "accent-green",
    gradient: "from-accent-green/10 via-accent-green/5 to-transparent",
  },
  {
    title: "Editar Produto",
    description: "Remova fundo, mude cenário, ajuste iluminação",
    href: "/dashboard/editor",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
      </svg>
    ),
    color: "accent-violet",
    gradient: "from-accent-violet/10 via-accent-violet/5 to-transparent",
  },
  {
    title: "Try-On Virtual",
    description: "Experimente armações virtualmente",
    href: "/dashboard/tryon",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: "accent-teal",
    gradient: "from-accent-teal/10 via-accent-teal/5 to-transparent",
  },
  {
    title: "Assistente",
    description: "Chat inteligente para vendas",
    href: "/dashboard/assistente",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: "accent-amber",
    gradient: "from-accent-amber/10 via-accent-amber/5 to-transparent",
  },
];

const toolLabels: Record<string, string> = {
  CRIADOR: "Criador de Artes",
  TRYON: "Try-On Virtual",
  EDITOR: "Editor de Produtos",
  ASSISTENTE: "Assistente",
};

const toolColors: Record<string, string> = {
  CRIADOR: "accent-green",
  TRYON: "accent-teal",
  EDITOR: "accent-violet",
  ASSISTENTE: "accent-amber",
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
  const isUnlimited = planLimit === 999999;
  const remaining = isUnlimited ? Infinity : planLimit - usage;
  const usagePercent = isUnlimited ? 0 : Math.min((usage / planLimit) * 100, 100);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-bg-card-hover" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-bg-card" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-bg-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          Olá, <span className="text-gradient-brand">{profile?.name?.split(" ")[0] || "Usuário"}</span>
        </h1>
        <p className="text-text-muted text-sm mt-2">
          Aqui está o resumo da sua ótica hoje.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up delay-100">
        {/* Usage Card - Featured */}
        <div className="card-featured rounded-2xl p-5 sm:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Uso este mês</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-4xl font-bold font-[var(--font-heading)] text-gradient-brand">{usage}</span>
                <span className="text-lg text-text-muted font-medium">/ {isUnlimited ? "∞" : planLimit}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-deep border border-border">
              <div className={`w-2 h-2 rounded-full ${remaining > 5 || isUnlimited ? "bg-accent-green" : remaining > 0 ? "bg-accent-amber" : "bg-accent-rose"}`} />
              <span className="text-xs font-medium text-text-secondary">
                {isUnlimited ? "Ilimitado" : `${remaining} restantes`}
              </span>
            </div>
          </div>
          {!isUnlimited && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-bg-deep overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    usagePercent > 80 ? "bg-gradient-to-r from-accent-amber to-accent-rose" : "bg-gradient-to-r from-accent-green to-accent-teal"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-text-muted">0</span>
                <span className="text-[10px] text-text-muted">{planLimit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Plan Card */}
        <div className="card-base rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Plano atual</p>
            <p className="text-2xl font-bold font-[var(--font-heading)] mt-2">{profile?.plan || "STARTER"}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-green/10 border border-accent-green/15">
              <svg className="w-3 h-3 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-medium text-accent-green">Ativo</span>
            </div>
            <span className="text-[11px] text-text-muted">{recent.length}+ criações salvas</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-up delay-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-[var(--font-heading)] tracking-tight">Ferramentas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group card-base rounded-2xl p-5 flex items-start gap-4"
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} border border-${action.color}/15 flex items-center justify-center text-${action.color} group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold font-[var(--font-heading)] group-hover:text-accent-green transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{action.description}</p>
                <span className={`inline-flex items-center gap-1 mt-2.5 text-[11px] font-semibold text-${action.color} opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0`}>
                  Abrir
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recent.length > 0 && (
        <div className="animate-fade-up delay-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[var(--font-heading)] tracking-tight">Atividade Recente</h2>
            <Link href="/dashboard/galeria" className="text-xs text-text-muted hover:text-accent-green transition-colors font-medium">
              Ver galeria
            </Link>
          </div>
          <div className="card-base rounded-2xl overflow-hidden divide-y divide-border">
            {recent.map((item) => {
              const color = toolColors[item.tool] || "accent-green";
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-card-hover/50 transition-colors">
                  <div className={`shrink-0 w-9 h-9 rounded-lg bg-${color}/10 border border-${color}/15 flex items-center justify-center`}>
                    <div className={`w-2 h-2 rounded-full bg-${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.prompt.slice(0, 65)}...</p>
                    <p className={`text-[11px] text-${color}/70 font-medium mt-0.5`}>{toolLabels[item.tool] || item.tool}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-text-muted tabular-nums">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
