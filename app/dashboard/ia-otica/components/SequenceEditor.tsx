"use client";

import { useState, useEffect } from "react";

interface Step {
  id?: string;
  step_order: number;
  delay_minutes: number;
  allowed_hours_start: number;
  allowed_hours_end: number;
  allowed_days: number[];
  message_type: "TEXT" | "PHOTO" | "VIDEO";
  message_content: string;
  media_url: string | null;
}

interface SequenceEditorProps {
  sequenceId: string | null;
  onClose: () => void;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const categories = [
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "POST_SALE", label: "Pós-venda" },
  { value: "REENGAGEMENT", label: "Reengajamento" },
  { value: "CUSTOM", label: "Personalizado" },
];

function formatDelay(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

export default function SequenceEditor({ sequenceId, onClose }: SequenceEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CUSTOM");
  const [steps, setSteps] = useState<Step[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingStep, setEditingStep] = useState<number | null>(null);

  useEffect(() => {
    if (!sequenceId) return;
    async function load() {
      const res = await fetch(`/api/ia-otica/sequences/${sequenceId}`);
      const data = await res.json();
      if (res.ok && data.sequence) {
        setTitle(data.sequence.title);
        setDescription(data.sequence.description || "");
        setCategory(data.sequence.category);
        setSteps(data.sequence.steps || []);
      }
    }
    load();
  }, [sequenceId]);

  const addStep = () => {
    const newStep: Step = {
      step_order: steps.length + 1,
      delay_minutes: steps.length === 0 ? 60 : 1440,
      allowed_hours_start: 8,
      allowed_hours_end: 20,
      allowed_days: [1, 2, 3, 4, 5],
      message_type: "TEXT",
      message_content: "",
      media_url: null,
    };
    setSteps([...steps, newStep]);
    setEditingStep(steps.length);
  };

  const updateStep = (index: number, updates: Partial<Step>) => {
    setSteps(steps.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })));
    setEditingStep(null);
  };

  const toggleDay = (stepIndex: number, day: number) => {
    const step = steps[stepIndex];
    const newDays = step.allowed_days.includes(day)
      ? step.allowed_days.filter((d) => d !== day)
      : [...step.allowed_days, day].sort();
    updateStep(stepIndex, { allowed_days: newDays });
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const method = sequenceId ? "PUT" : "POST";
      const url = sequenceId ? `/api/ia-otica/sequences/${sequenceId}` : "/api/ia-otica/sequences";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, steps }),
      });

      if (res.ok) onClose();
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="btn-press px-5 py-2.5 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-bold hover:bg-accent-green/20 transition-colors disabled:opacity-40"
        >
          {saving ? "Salvando..." : "Salvar Sequência"}
        </button>
      </div>

      {/* Sequence info */}
      <div className="card-base rounded-2xl p-6 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da sequência"
          className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none text-sm font-medium"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none text-xs"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat.value
                  ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                  : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Steps timeline */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold font-[var(--font-heading)] mb-4">Etapas ({steps.length})</h3>

        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-accent-green/15 border border-accent-green/20 flex items-center justify-center text-xs font-bold text-accent-green shrink-0">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>

            {/* Step card */}
            <div className="flex-1 mb-4">
              {editingStep === index ? (
                /* Editing mode */
                <div className="card-base rounded-2xl p-5 space-y-4">
                  {/* Delay */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">Delay (minutos)</label>
                      <input
                        type="number"
                        value={step.delay_minutes}
                        onChange={(e) => updateStep(index, { delay_minutes: parseInt(e.target.value) || 0 })}
                        className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none"
                      />
                      <p className="text-[10px] text-text-muted mt-1">= {formatDelay(step.delay_minutes)} após etapa anterior</p>
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">Horário de envio</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" max="23" value={step.allowed_hours_start}
                          onChange={(e) => updateStep(index, { allowed_hours_start: parseInt(e.target.value) || 0 })}
                          className="input-glow w-16 px-2 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs text-center focus:outline-none"
                        />
                        <span className="text-text-muted text-xs">às</span>
                        <input type="number" min="0" max="23" value={step.allowed_hours_end}
                          onChange={(e) => updateStep(index, { allowed_hours_end: parseInt(e.target.value) || 0 })}
                          className="input-glow w-16 px-2 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs text-center focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Days */}
                  <div>
                    <label className="block text-[11px] text-text-muted mb-2">Dias permitidos</label>
                    <div className="flex gap-1.5">
                      {dayNames.map((name, day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(index, day)}
                          className={`w-10 h-8 rounded-lg text-[11px] font-medium transition-all ${
                            step.allowed_days.includes(day)
                              ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                              : "bg-bg-deep border border-border text-text-muted"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message type */}
                  <div>
                    <label className="block text-[11px] text-text-muted mb-2">Tipo de mensagem</label>
                    <div className="flex gap-2">
                      {(["TEXT", "PHOTO", "VIDEO"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateStep(index, { message_type: type })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            step.message_type === type
                              ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                              : "bg-bg-deep border border-border text-text-muted"
                          }`}
                        >
                          {type === "TEXT" ? "Texto" : type === "PHOTO" ? "Foto" : "Vídeo"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message content */}
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1.5">Mensagem</label>
                    <textarea
                      value={step.message_content}
                      onChange={(e) => updateStep(index, { message_content: e.target.value })}
                      placeholder="Digite a mensagem..."
                      rows={3}
                      className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary placeholder:text-text-muted text-xs focus:outline-none resize-none"
                    />
                  </div>

                  {step.message_type !== "TEXT" && (
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">URL da mídia</label>
                      <input
                        type="text"
                        value={step.media_url || ""}
                        onChange={(e) => updateStep(index, { media_url: e.target.value || null })}
                        placeholder="https://..."
                        className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary placeholder:text-text-muted text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button onClick={() => removeStep(index)} className="text-xs text-accent-rose hover:underline">Excluir etapa</button>
                    <button onClick={() => setEditingStep(null)} className="px-4 py-2 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium">Fechar</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <button onClick={() => setEditingStep(index)} className="card-base rounded-2xl p-4 w-full text-left hover:border-accent-green/20 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-bg-deep border border-border text-text-muted font-medium">
                        {formatDelay(step.delay_minutes)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {step.allowed_hours_start}h-{step.allowed_hours_end}h
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {step.allowed_days.map((d) => dayNames[d]).join(", ")}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                      step.message_type === "TEXT" ? "bg-accent-green/10 text-accent-green" :
                      step.message_type === "PHOTO" ? "bg-accent-violet/10 text-accent-violet" :
                      "bg-accent-amber/10 text-accent-amber"
                    }`}>
                      {step.message_type === "TEXT" ? "Texto" : step.message_type === "PHOTO" ? "Foto" : "Vídeo"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{step.message_content || "(sem mensagem)"}</p>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add step button */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          </div>
          <button
            onClick={addStep}
            className="flex-1 py-3 rounded-2xl border-2 border-dashed border-border text-text-muted hover:border-accent-green/20 hover:text-accent-green text-xs font-medium transition-all"
          >
            Adicionar etapa
          </button>
        </div>
      </div>
    </div>
  );
}
