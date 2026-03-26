"use client";

import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  source: string;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const dayNamesShort = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const statusColors: Record<string, string> = {
  SCHEDULED: "accent-teal",
  CONFIRMED: "accent-green",
  CANCELLED: "accent-rose",
  COMPLETED: "accent-green",
  NO_SHOW: "accent-amber",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
  NO_SHOW: "Não compareceu",
};

export default function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth}`;
      try {
        const res = await fetch(`/api/ia-agendamento/calendar?start=${start}&end=${end}`);
        const data = await res.json();
        if (res.ok) setAppointments(data.appointments || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [year, month, daysInMonth]);

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((a) => a.appointment_date === dateStr);
  };

  const selectedAppts = selectedDate
    ? appointments.filter((a) => a.appointment_date === selectedDate).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
    : [];

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
      {/* Calendar */}
      <div className="lg:col-span-2 card-base rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold font-[var(--font-heading)]">
            {monthNames[month]} {year}
          </h2>
          <button onClick={next} className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d, i) => (
            <div key={d} className="text-center text-[11px] text-text-muted font-medium py-1">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{dayNamesShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayAppts = getAppointmentsForDay(day);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-sm transition-all ${
                  isSelected
                    ? "bg-accent-teal/15 border border-accent-teal/30 text-accent-teal"
                    : isToday(day)
                    ? "bg-accent-green/10 border border-accent-green/20 text-accent-green"
                    : "hover:bg-bg-card-hover text-text-secondary"
                }`}
              >
                <span className="text-xs font-medium">{day}</span>
                {dayAppts.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayAppts.slice(0, 3).map((a) => (
                      <div key={a.id} className={`w-1.5 h-1.5 rounded-full bg-${statusColors[a.status] || "accent-teal"}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {loading && <p className="text-xs text-text-muted text-center mt-4">Carregando...</p>}
      </div>

      {/* Day detail */}
      <div className="card-base rounded-2xl p-6">
        <h3 className="text-sm font-bold font-[var(--font-heading)] mb-4">
          {selectedDate
            ? `${parseInt(selectedDate.split("-")[2])} de ${monthNames[parseInt(selectedDate.split("-")[1]) - 1]}`
            : "Selecione um dia"}
        </h3>

        {!selectedDate ? (
          <p className="text-xs text-text-muted">Clique em um dia no calendário para ver os agendamentos.</p>
        ) : selectedAppts.length === 0 ? (
          <p className="text-xs text-text-muted">Nenhum agendamento neste dia.</p>
        ) : (
          <div className="space-y-3">
            {selectedAppts.map((appt) => {
              const color = statusColors[appt.status] || "accent-teal";
              return (
                <div key={appt.id} className="p-3 rounded-xl bg-bg-deep border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{appt.appointment_time.slice(0, 5)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md bg-${color}/10 text-${color} font-medium`}>
                      {statusLabels[appt.status] || appt.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{appt.customer_name}</p>
                  {appt.customer_phone && (
                    <p className="text-xs text-text-muted">{appt.customer_phone}</p>
                  )}
                  {appt.notes && (
                    <p className="text-xs text-text-muted italic truncate">{appt.notes}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span>{appt.duration_minutes}min</span>
                    <span>•</span>
                    <span>{appt.source === "AI" ? "Via IA" : "Manual"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
