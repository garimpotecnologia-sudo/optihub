"use client";

import { useState } from "react";
import CalendarPanel from "./CalendarPanel";
import AvailabilityConfig from "./AvailabilityConfig";

const tabs = [
  { id: "calendar", label: "Calendário" },
  { id: "availability", label: "Disponibilidade" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export default function IaAgendamentoDashboard() {
  const [tab, setTab] = useState<Tab>("calendar");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] tracking-tight">IA para Agendamento</h1>
          <p className="text-text-muted text-sm mt-1">Gerencie agendamentos e disponibilidade.</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-card border border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? "bg-accent-teal/15 text-accent-teal border border-accent-teal/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "calendar" && <CalendarPanel />}
      {tab === "availability" && <AvailabilityConfig />}
    </div>
  );
}
