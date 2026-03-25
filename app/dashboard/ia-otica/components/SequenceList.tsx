"use client";

import { useState, useEffect, useCallback } from "react";
import SequenceEditor from "./SequenceEditor";

interface Sequence {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  steps_count?: number;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  FOLLOW_UP: "Follow-up",
  POST_SALE: "Pós-venda",
  REENGAGEMENT: "Reengajamento",
  CUSTOM: "Personalizado",
};

const categoryColors: Record<string, string> = {
  FOLLOW_UP: "accent-green",
  POST_SALE: "accent-teal",
  REENGAGEMENT: "accent-amber",
  CUSTOM: "accent-violet",
};

export default function SequenceList() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ia-otica/sequences");
      const data = await res.json();
      if (res.ok) setSequences(data.sequences || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/ia-otica/sequences/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    setSequences((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta sequência?")) return;
    await fetch(`/api/ia-otica/sequences/${id}`, { method: "DELETE" });
    setSequences((prev) => prev.filter((s) => s.id !== id));
  };

  if (editing || creating) {
    return (
      <SequenceEditor
        sequenceId={editing}
        onClose={() => { setEditing(null); setCreating(false); load(); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{sequences.length} sequências</p>
        <button
          onClick={() => setCreating(true)}
          className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-bold hover:bg-accent-green/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Sequência
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-bg-card animate-pulse" />)}
        </div>
      ) : sequences.length === 0 ? (
        <div className="card-base rounded-2xl p-10 text-center">
          <p className="text-sm text-text-muted">Nenhuma sequência criada ainda.</p>
          <button onClick={() => setCreating(true)} className="mt-3 text-xs text-accent-green font-medium hover:underline">
            Criar primeira sequência
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => {
            const color = categoryColors[seq.category] || "accent-green";
            return (
              <div key={seq.id} className="card-base rounded-2xl p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold font-[var(--font-heading)] truncate">{seq.title}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-${color}/10 text-${color}`}>
                      {categoryLabels[seq.category] || seq.category}
                    </span>
                  </div>
                  {seq.description && <p className="text-xs text-text-muted truncate">{seq.description}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(seq.id, seq.is_active)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      seq.is_active ? "bg-accent-green/30" : "bg-bg-deep border border-border"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      seq.is_active ? "left-5.5 bg-accent-green" : "left-0.5 bg-text-muted"
                    }`} style={{ left: seq.is_active ? "22px" : "2px" }} />
                  </button>

                  {/* Edit */}
                  <button onClick={() => setEditing(seq.id)} className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(seq.id)} className="p-2 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
