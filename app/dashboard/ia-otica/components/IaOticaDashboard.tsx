"use client";

import { useState } from "react";
import AnalyticsPanel from "./AnalyticsPanel";
import SequenceList from "./SequenceList";

const tabs = [
  { id: "analytics", label: "Analytics" },
  { id: "sequences", label: "Sequências" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export default function IaOticaDashboard() {
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] tracking-tight">IA para Ótica</h1>
          <p className="text-text-muted text-sm mt-1">Monitore atendimentos e gerencie sequências de envio.</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-card border border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "analytics" && <AnalyticsPanel />}
      {tab === "sequences" && <SequenceList />}
    </div>
  );
}
