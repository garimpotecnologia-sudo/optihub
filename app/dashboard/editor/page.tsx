"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface SubOption { label: string; prompt: string; }
interface Action { id: string; label: string; icon: string; prompt: string; subOptions?: SubOption[]; }

const actions: Action[] = [
  { id: "remove-bg", label: "Remover Fundo", icon: "/editor-icons/remove-bg.png", prompt: "Remove the background from this product image, make it transparent/white" },
  { id: "lighting", label: "Ajustar Iluminação", icon: "/editor-icons/lighting.png", prompt: "Improve the lighting of this product photo, make it look professionally lit" },
  {
    id: "lifestyle", label: "Cenário Lifestyle", icon: "/editor-icons/lifestyle.png", prompt: "Place this eyewear product in a lifestyle scene",
    subOptions: [
      { label: "Mesa de café", prompt: "Place this eyewear on a wooden coffee table next to an open book and a cup of coffee, warm natural light, cozy lifestyle scene" },
      { label: "Beira da piscina", prompt: "Place this eyewear by a swimming pool edge on a white towel, summer vibes, bright sunny day, luxury resort feel" },
      { label: "Escritório moderno", prompt: "Place this eyewear on a modern minimalist desk with a laptop and plant, clean professional workspace" },
      { label: "Bancada de mármore", prompt: "Place this eyewear on a white marble countertop with a perfume bottle nearby, luxury lifestyle, soft lighting" },
      { label: "Piquenique ao ar livre", prompt: "Place this eyewear on a picnic blanket in a green park, natural sunlight, relaxed outdoor lifestyle" },
    ],
  },
  {
    id: "vitrine", label: "Cenário Vitrine", icon: "/editor-icons/vitrine.png", prompt: "Place this eyewear product in a premium store display",
    subOptions: [
      { label: "Vitrine premium", prompt: "Place this eyewear in a premium glass display case with LED spotlights, dark background, luxury store aesthetic" },
      { label: "Expositor de madeira", prompt: "Place this eyewear on a wooden display stand in a boutique store, warm ambient lighting, artisan feel" },
      { label: "Prateleira minimalista", prompt: "Place this eyewear on a floating white shelf against a clean wall, minimalist modern optical store" },
      { label: "Display com espelho", prompt: "Place this eyewear on a mirrored display surface, showing the reflection, upscale store environment" },
      { label: "Balcão de atendimento", prompt: "Place this eyewear on a sleek store counter with soft backlighting, ready for customer viewing" },
    ],
  },
  {
    id: "studio", label: "Cenário Estúdio", icon: "/editor-icons/studio.png", prompt: "Place this eyewear product on a clean studio background",
    subOptions: [
      { label: "Fundo branco infinito", prompt: "Place this eyewear on a pure white infinite background, clean studio shot with soft shadow, product photography" },
      { label: "Gradiente cinza", prompt: "Place this eyewear floating on a smooth gray gradient background, professional studio lighting from above" },
      { label: "Fundo colorido", prompt: "Place this eyewear on a bold vibrant colored background, pop art style studio shot, high contrast" },
      { label: "Superfície refletiva", prompt: "Place this eyewear on a black reflective surface, dramatic studio lighting, high-end product photography" },
      { label: "Sombra artística", prompt: "Place this eyewear on a beige surface with dramatic side lighting creating artistic shadows, editorial style" },
    ],
  },
  {
    id: "variations", label: "Variações", icon: "/editor-icons/variations.png", prompt: "Generate creative variations of this eyewear product photo",
    subOptions: [
      { label: "Variação de cores", prompt: "Generate color variations of this eyewear, show the same frame in different colors (black, tortoise, clear, blue)" },
      { label: "Ângulos diferentes", prompt: "Show this eyewear from different angles: front view, 3/4 view, side profile, and folded" },
      { label: "Diferentes lentes", prompt: "Show this eyewear frame with different lens options: clear, gradient, mirror, polarized" },
      { label: "Flat lay", prompt: "Create a flat lay composition of this eyewear with accessories: case, cleaning cloth, and box" },
      { label: "Composição artística", prompt: "Create an artistic editorial composition of this eyewear with dramatic lighting and creative positioning" },
    ],
  },
];

const formatos = [
  { id: "post-feed", label: "Post Feed", desc: "Instagram / Facebook", ratio: "1:1", w: 40, h: 40 },
  { id: "post-retrato", label: "Post Retrato", desc: "Melhor engajamento", ratio: "4:5", w: 36, h: 48 },
  { id: "story", label: "Story / Reels", desc: "Instagram / TikTok", ratio: "9:16", w: 28, h: 50 },
  { id: "banner", label: "Banner", desc: "Site / Facebook Cover", ratio: "16:9", w: 50, h: 28 },
];

export default function EditorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [formato, setFormato] = useState(formatos[0]);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ url: string; prompt: string; saved: boolean; saving: boolean }[]>([]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    Array.from(newFiles).forEach((file) => {
      setFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, []);

  const currentAction = actions.find((a) => a.id === selectedAction);
  const basePrompt = selectedSub || currentAction?.prompt || "";
  const currentPrompt = isEditing ? editedPrompt : (editedPrompt || basePrompt);

  const handleProcess = async () => {
    if (!files.length || !currentPrompt) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = async () => {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: currentPrompt, referenceImage: reader.result as string, ratio: formato.ratio, tool: "EDITOR" }),
        });
        const data = await res.json();
        if (data.error) alert(`Erro: ${data.error}`);
        else if (data.imageUrl) setResults((prev) => [{ url: data.imageUrl, prompt: currentPrompt, saved: false, saving: false }, ...prev]);
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">Editor de Produtos</h1>
        <p className="text-text-secondary text-sm mt-1">Edite fotos dos seus produtos com IA.</p>
      </div>

      {/* Main panel */}
      <div className="rounded-2xl card-base p-5 space-y-5">

        {/* Upload area */}
        <div className="flex gap-4 items-start">
          <div
            className="shrink-0 w-28 h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-accent-green/30 transition-colors cursor-pointer overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file"; input.multiple = true; input.accept = "image/*";
              input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
              input.click();
            }}
          >
            {previews.length > 0 ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previews[0]} alt="Produto" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-bg-deep/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-medium">Trocar</span>
                </div>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 text-text-muted/40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-[10px] text-text-muted">Upload foto</span>
              </>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Foto do produto</span>
            <p className="text-[11px] text-text-muted/70">Arraste ou clique para subir a foto do produto. PNG, JPG, WebP.</p>
            {previews.length > 1 && (
              <div className="flex gap-1.5 mt-2">
                {previews.slice(1).map((src, i) => (
                  <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { setFiles(p => p.filter((_, idx) => idx !== i + 1)); setPreviews(p => p.filter((_, idx) => idx !== i + 1)); }} className="absolute inset-0 bg-bg-deep/50 flex items-center justify-center opacity-0 hover:opacity-100 text-[8px] text-accent-rose">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions as image buttons */}
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block mb-2">O que deseja fazer?</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => { setSelectedAction(a.id); setSelectedSub(null); setEditedPrompt(""); setIsEditing(false); }}
                className={`btn-press relative rounded-xl overflow-hidden transition-all aspect-square ${
                  selectedAction === a.id
                    ? "ring-2 ring-accent-green ring-offset-2 ring-offset-bg-card shadow-[0_0_20px_rgba(3,255,148,0.12)]"
                    : "ring-1 ring-border hover:ring-border-hover"
                }`}
              >
                <Image src={a.icon} alt={a.label} width={200} height={200} className="w-full h-full object-cover" />
                {/* Label overlay at bottom */}
                <div className={`absolute inset-x-0 bottom-0 py-1.5 px-1 text-center transition-all ${
                  selectedAction === a.id
                    ? "bg-accent-green/90"
                    : "bg-bg-deep/80 backdrop-blur-sm"
                }`}>
                  <span className={`text-[9px] font-bold leading-none ${selectedAction === a.id ? "text-bg-deep" : "text-text-secondary"}`}>
                    {a.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-options */}
        {currentAction?.subOptions && (
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block mb-2">
              {currentAction.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentAction.subOptions.map((sub) => (
                <button
                  key={sub.label}
                  onClick={() => { setSelectedSub(sub.prompt); setEditedPrompt(""); setIsEditing(false); }}
                  className={`btn-press px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    selectedSub === sub.prompt
                      ? "bg-accent-teal/15 text-accent-teal border border-accent-teal/30"
                      : "bg-bg-deep border border-border text-text-secondary hover:bg-bg-card-hover"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formato — igual ao Criador de Artes */}
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block mb-2">Formato</span>
          <div className="grid grid-cols-4 gap-2">
            {formatos.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormato(f)}
                className={`btn-press flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${
                  formato.id === f.id
                    ? "bg-accent-green/15 border border-accent-green/30"
                    : "bg-bg-deep border border-border hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-center w-full h-12">
                  <div
                    className={`rounded-[3px] border transition-all ${
                      formato.id === f.id ? "border-accent-green bg-accent-green/10" : "border-text-muted/25 bg-bg-card-hover"
                    }`}
                    style={{ width: `${f.w}px`, height: `${f.h}px`, maxWidth: "48px", maxHeight: "48px" }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center gap-[2px] p-1">
                      <div className={`w-full h-[2px] rounded-full ${formato.id === f.id ? "bg-accent-green/30" : "bg-text-muted/15"}`} />
                      <div className={`w-3/4 h-[2px] rounded-full ${formato.id === f.id ? "bg-accent-green/20" : "bg-text-muted/10"}`} />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`block text-[10px] font-bold leading-tight ${formato.id === f.id ? "text-accent-green" : "text-text-secondary"}`}>{f.label}</span>
                  <span className={`block text-[8px] mt-0.5 ${formato.id === f.id ? "text-accent-green/60" : "text-text-muted/50"}`}>{f.ratio} · {f.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt preview / edit */}
        {selectedAction && (
          <div className="p-3 rounded-xl bg-bg-elevated/50 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Prompt</span>
              <button
                onClick={() => { if (!isEditing) setEditedPrompt(currentPrompt || basePrompt); setIsEditing(!isEditing); }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${isEditing ? "bg-accent-amber/20 text-accent-amber" : "text-text-muted hover:text-accent-amber"}`}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                {isEditing ? "OK" : "Editar"}
              </button>
            </div>
            {isEditing ? (
              <textarea value={editedPrompt} onChange={(e) => setEditedPrompt(e.target.value)} rows={2} className="input-glow w-full px-2.5 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-[11px] font-mono leading-relaxed focus:outline-none transition-all resize-none" />
            ) : (
              <p className="text-[11px] text-text-secondary font-mono leading-relaxed">{currentPrompt || "Selecione uma ação..."}</p>
            )}
          </div>
        )}

        {/* Process button */}
        <button
          onClick={handleProcess}
          disabled={loading || !currentPrompt || !previews.length}
          className="btn-press w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_25px_rgba(3,255,148,0.2)] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processando...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Processar</>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-[700] font-[var(--font-heading)] mb-3 tracking-tight">Resultados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, i) => (
              <div key={i} className="rounded-2xl card-base overflow-hidden">
                <div className="aspect-square bg-bg-card-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={`Resultado ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-2">
                  {!item.saved ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-accent-amber/[0.06] border border-accent-amber/15">
                      <span className="text-[10px] text-accent-amber/80 flex-1">Salvar na galeria?</span>
                      <button
                        onClick={async () => {
                          setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saving: true } : r));
                          try {
                            await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: item.url, tool: "EDITOR", prompt: item.prompt, metadata: { action: selectedAction } }) });
                            setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saved: true, saving: false } : r));
                          } catch { setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saving: false } : r)); }
                        }}
                        disabled={item.saving}
                        className="btn-press px-2.5 py-0.5 rounded text-[10px] font-bold bg-accent-green/20 text-accent-green"
                      >{item.saving ? "..." : "Sim"}</button>
                      <button onClick={() => setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saved: true } : r))} className="text-[10px] text-text-muted">Não</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-accent-green/70">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Salvo
                    </div>
                  )}
                  <div className="flex gap-2">
                    <a href={item.url} download target="_blank" className="btn-press flex-1 py-2 rounded-lg text-[11px] font-bold bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors text-center">Download</a>
                    <button className="btn-press flex-1 py-2 rounded-lg text-[11px] font-medium border border-border text-text-secondary hover:border-accent-green/30 hover:text-accent-green transition-colors">Compartilhar</button>
                  </div>
                  <details>
                    <summary className="text-[9px] text-text-muted cursor-pointer hover:text-text-secondary">Ver prompt</summary>
                    <pre className="mt-1 p-2 rounded bg-bg-deep border border-border text-[9px] font-mono text-text-muted whitespace-pre-wrap max-h-24 overflow-y-auto">{item.prompt}</pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl card-base overflow-hidden animate-pulse">
              <div className="aspect-square bg-bg-card-hover" />
              <div className="p-3 flex gap-2"><div className="flex-1 h-8 rounded-lg bg-bg-card-hover" /><div className="flex-1 h-8 rounded-lg bg-bg-card-hover" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
