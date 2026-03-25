"use client";

import { useState, useEffect } from "react";

type Period = "day" | "week" | "month";

interface Analytics {
  attendance: number;
  handoff: number;
  quote: number;
}

const periodLabels: Record<Period, string> = {
  day: "Hoje",
  week: "Semana",
  month: "Mês",
};

export default function AnalyticsPanel() {
  const [period, setPeriod] = useState<Period>("day");
  const [data, setData] = useState<Analytics>({ attendance: 0, handoff: 0, quote: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ia-otica/analytics?period=${period}`);
        const json = await res.json();
        if (res.ok) setData(json);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [period]);

  const stats = [
    { label: "Atendimentos", value: data.attendance, color: "accent-green", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )},
    { label: "Transbordos", value: data.handoff, color: "accent-amber", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    )},
    { label: "Orçamentos", value: data.quote, color: "accent-teal", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Period selector */}
      <div className="flex gap-2">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              period === p
                ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                : "bg-bg-card border border-border text-text-muted hover:text-text-secondary"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-base rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-2.5 rounded-xl bg-${stat.color}/10 text-${stat.color}`}>
                {stat.icon}
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                {periodLabels[period]}
              </span>
            </div>
            <div className={`text-3xl font-bold font-[var(--font-heading)] ${loading ? "animate-pulse text-text-muted" : ""}`}>
              {loading ? "—" : stat.value}
            </div>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
