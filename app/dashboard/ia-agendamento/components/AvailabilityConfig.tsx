"use client";

import { useState, useEffect } from "react";

interface DayConfig {
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const defaultConfig: DayConfig[] = Array.from({ length: 7 }, (_, i) => ({
  day_of_week: i,
  is_available: i >= 1 && i <= 5,
  start_time: "08:00",
  end_time: "18:00",
  slot_duration_minutes: 30,
}));

export default function AvailabilityConfig() {
  const [config, setConfig] = useState<DayConfig[]>(defaultConfig);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [availRes, blockedRes] = await Promise.all([
          fetch("/api/ia-agendamento/availability"),
          fetch("/api/ia-agendamento/blocked-dates"),
        ]);
        const availData = await availRes.json();
        const blockedData = await blockedRes.json();

        if (availData.availability?.length > 0) {
          const merged = defaultConfig.map((dc) => {
            const saved = availData.availability.find((a: DayConfig) => a.day_of_week === dc.day_of_week);
            return saved ? { ...dc, ...saved } : dc;
          });
          setConfig(merged);
        }
        if (blockedData.dates) setBlockedDates(blockedData.dates);
      } catch { /* ignore */ }
    }
    load();
  }, []);

  const updateDay = (index: number, updates: Partial<DayConfig>) => {
    setConfig(config.map((c, i) => i === index ? { ...c, ...updates } : c));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/ia-agendamento/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: config }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const addBlockedDate = async () => {
    if (!newBlockedDate) return;
    try {
      const res = await fetch("/api/ia-agendamento/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_date: newBlockedDate, reason: newBlockedReason || null }),
      });
      const data = await res.json();
      if (res.ok && data.date) {
        setBlockedDates([...blockedDates, data.date]);
        setNewBlockedDate("");
        setNewBlockedReason("");
      }
    } catch { /* ignore */ }
  };

  const removeBlockedDate = async (id: string) => {
    await fetch(`/api/ia-agendamento/blocked-dates?id=${id}`, { method: "DELETE" });
    setBlockedDates(blockedDates.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Weekly availability */}
      <div className="card-base rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-[var(--font-heading)]">Horários Semanais</h3>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-press px-4 py-2 rounded-xl bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-xs font-bold hover:bg-accent-teal/20 transition-colors disabled:opacity-40"
          >
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
          </button>
        </div>

        <div className="space-y-2">
          {config.map((day, index) => (
            <div key={day.day_of_week} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
              day.is_available ? "bg-bg-deep" : "bg-bg-deep/50 opacity-60"
            }`}>
              {/* Toggle */}
              <button
                onClick={() => updateDay(index, { is_available: !day.is_available })}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                  day.is_available ? "bg-accent-teal/30" : "bg-bg-card border border-border"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  day.is_available ? "bg-accent-teal" : "bg-text-muted"
                }`} style={{ left: day.is_available ? "22px" : "2px" }} />
              </button>

              {/* Day name */}
              <span className="text-xs font-medium w-20 shrink-0">{dayNames[day.day_of_week]}</span>

              {day.is_available && (
                <>
                  {/* Start time */}
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => updateDay(index, { start_time: e.target.value })}
                    className="px-2 py-1.5 rounded-lg bg-bg-card border border-border text-text-primary text-xs focus:outline-none focus:border-accent-teal/30"
                  />
                  <span className="text-text-muted text-xs">às</span>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => updateDay(index, { end_time: e.target.value })}
                    className="px-2 py-1.5 rounded-lg bg-bg-card border border-border text-text-primary text-xs focus:outline-none focus:border-accent-teal/30"
                  />
                  <span className="text-text-muted text-xs shrink-0">Slot:</span>
                  <select
                    value={day.slot_duration_minutes}
                    onChange={(e) => updateDay(index, { slot_duration_minutes: parseInt(e.target.value) })}
                    className="px-2 py-1.5 rounded-lg bg-bg-card border border-border text-text-primary text-xs focus:outline-none"
                  >
                    <option value={15}>15min</option>
                    <option value={30}>30min</option>
                    <option value={45}>45min</option>
                    <option value={60}>1h</option>
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="card-base rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-[var(--font-heading)]">Datas Bloqueadas</h3>
        <p className="text-xs text-text-muted">Dias em que não há possibilidade de agendamento.</p>

        <div className="flex gap-3">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none focus:border-accent-teal/30"
          />
          <input
            type="text"
            value={newBlockedReason}
            onChange={(e) => setNewBlockedReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary placeholder:text-text-muted text-xs focus:outline-none focus:border-accent-teal/30"
          />
          <button
            onClick={addBlockedDate}
            disabled={!newBlockedDate}
            className="btn-press px-4 py-2 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-bold hover:bg-accent-rose/20 transition-colors disabled:opacity-40"
          >
            Bloquear
          </button>
        </div>

        {blockedDates.length > 0 && (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div key={bd.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-deep border border-border">
                <div>
                  <span className="text-xs font-medium">
                    {new Date(bd.blocked_date + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                  {bd.reason && <span className="text-xs text-text-muted ml-2">— {bd.reason}</span>}
                </div>
                <button onClick={() => removeBlockedDate(bd.id)} className="text-xs text-accent-rose hover:underline">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
