"use client";

import { useState, useCallback } from "react";

interface SubOption {
  label: string;
  prompt: string;
}

interface Action {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  subOptions?: SubOption[];
}

const actions: Action[] = [
  {
    id: "remove-bg",
    label: "Remover Fundo",
    icon: "🪄",
    prompt: "Remove the background from this product image, make it transparent/white",
  },
  {
    id: "lighting",
    label: "Ajustar Iluminação",
    icon: "💡",
    prompt: "Improve the lighting of this product photo, make it look professionally lit",
  },
  {
    id: "lifestyle",
    label: "Cenário Lifestyle",
    icon: "🏠",
    prompt: "Place this eyewear product in a lifestyle scene",
    subOptions: [
      { label: "Mesa de café com livro", prompt: "Place this eyewear on a wooden coffee table next to an open book and a cup of coffee, warm natural light, cozy lifestyle scene" },
      { label: "Beira da piscina", prompt: "Place this eyewear by a swimming pool edge on a white towel, summer vibes, bright sunny day, luxury resort feel" },
      { label: "Mesa de escritório moderna", prompt: "Place this eyewear on a modern minimalist desk with a laptop and plant, clean professional workspace" },
      { label: "Bancada de mármore", prompt: "Place this eyewear on a white marble countertop with a perfume bottle nearby, luxury lifestyle, soft lighting" },
      { label: "Piquenique ao ar livre", prompt: "Place this eyewear on a picnic blanket in a green park, natural sunlight, relaxed outdoor lifestyle" },
    ],
  },
  {
    id: "vitrine",
    label: "Cenário Vitrine",
    icon: "🪟",
    prompt: "Place this eyewear product in a premium store display",
    subOptions: [
      { label: "Vitrine premium iluminada", prompt: "Place this eyewear in a premium glass display case with LED spotlights, dark background, luxury store aesthetic" },
      { label: "Expositor de madeira", prompt: "Place this eyewear on a wooden display stand in a boutique store, warm ambient lighting, artisan feel" },
      { label: "Prateleira minimalista", prompt: "Place this eyewear on a floating white shelf against a clean wall, minimalist modern optical store" },
      { label: "Display com espelho", prompt: "Place this eyewear on a mirrored display surface, showing the reflection, upscale store environment" },
      { label: "Balcão de atendimento", prompt: "Place this eyewear on a sleek store counter with soft backlighting, ready for customer viewing" },
    ],
  },
  {
    id: "studio",
    label: "Cenário Estúdio",
    icon: "📸",
    prompt: "Place this eyewear product on a clean studio background",
    subOptions: [
      { label: "Fundo branco infinito", prompt: "Place this eyewear on a pure white infinite background, clean studio shot with soft shadow, product photography" },
      { label: "Fundo gradiente cinza", prompt: "Place this eyewear floating on a smooth gray gradient background, professional studio lighting from above" },
      { label: "Fundo colorido vibrante", prompt: "Place this eyewear on a bold vibrant colored background, pop art style studio shot, high contrast" },
      { label: "Sobre superfície refletiva", prompt: "Place this eyewear on a black reflective surface, dramatic studio lighting, high-end product photography" },
      { label: "Com sombra artística", prompt: "Place this eyewear on a beige surface with dramatic side lighting creating artistic shadows, editorial style" },
    ],
  },
  {
    id: "variations",
    label: "Gerar Variações",
    icon: "🔄",
    prompt: "Generate creative variations of this eyewear product photo",
    subOptions: [
      { label: "Variação de cores", prompt: "Generate color variations of this eyewear, show the same frame in different colors (black, tortoise, clear, blue)" },
      { label: "Ângulos diferentes", prompt: "Show this eyewear from different angles: front view, 3/4 view, side profile, and folded" },
      { label: "Com diferentes lentes", prompt: "Show this eyewear frame with different lens options: clear, gradient, mirror, polarized" },
      { label: "Estilo flat lay", prompt: "Create a flat lay composition of this eyewear with accessories: case, cleaning cloth, and box" },
      { label: "Composição artística", prompt: "Create an artistic editorial composition of this eyewear with dramatic lighting and creative positioning" },
    ],
  },
];

const formatos = [
  { id: "1:1", label: "1:1", desc: "Quadrado", w: 40, h: 40 },
  { id: "4:5", label: "4:5", desc: "Retrato", w: 36, h: 48 },
  { id: "9:16", label: "9:16", desc: "Story", w: 28, h: 50 },
  { id: "16:9", label: "16:9", desc: "Banner", w: 50, h: 28 },
];

export default function EditorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [ratio, setRatio] = useState("1:1");
  const [editedPrompt, setEditedPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ url: string; prompt: string; saved: boolean; saving: boolean }[]>([]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...fileArray]);
    fileArray.forEach((file) => {
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
        const base64 = reader.result as string;
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: currentPrompt,
            referenceImage: base64,
            ratio,
            tool: "EDITOR",
          }),
        });
        const data = await res.json();
        if (data.error) {
          alert(`Erro: ${data.error}`);
        } else if (data.imageUrl) {
          setResults((prev) => [{ url: data.imageUrl, prompt: currentPrompt, saved: false, saving: false }, ...prev]);
        }
        setLoading(false);
      };
    } catch (err) {
      console.error("Erro ao processar:", err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">
          Editor de Produtos
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Edite fotos dos seus produtos com IA. Remova fundos, mude cenários e mais.
        </p>
      </div>

      {/* Step 1: Choose action FIRST */}
      <div>
        <h2 className="text-sm font-[600] text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center">1</span>
          O que deseja fazer?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                setSelectedAction(action.id);
                setSelectedSub(null);
                setEditedPrompt("");
                setIsEditing(false);
              }}
              className={`btn-press p-4 rounded-xl border text-left transition-all ${
                selectedAction === action.id
                  ? "border-accent-green/40 bg-accent-green/5"
                  : "border-border bg-bg-card hover:bg-bg-card-hover"
              }`}
            >
              <span className="text-2xl block mb-2">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-options */}
      {currentAction?.subOptions && (
        <div>
          <h2 className="text-sm font-[600] text-text-muted mb-3 uppercase tracking-wider">
            Escolha uma variação de {currentAction.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentAction.subOptions.map((sub) => (
              <button
                key={sub.label}
                onClick={() => { setSelectedSub(sub.prompt); setEditedPrompt(""); setIsEditing(false); }}
                className={`btn-press p-3 rounded-lg border text-left transition-all text-xs ${
                  selectedSub === sub.prompt
                    ? "border-accent-green/40 bg-accent-green/5 text-accent-green"
                    : "border-border bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose format */}
      <div>
        <h2 className="text-sm font-[600] text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center">2</span>
          Tamanho da imagem
        </h2>
        <div className="flex flex-wrap gap-3">
          {formatos.map((f) => (
            <button
              key={f.id}
              onClick={() => setRatio(f.id)}
              className={`btn-press flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[70px] ${
                ratio === f.id
                  ? "bg-accent-green/15 border border-accent-green/30"
                  : "bg-bg-deep border border-border hover:border-border-hover"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-14">
                <div
                  className={`rounded-[3px] border transition-all ${
                    ratio === f.id
                      ? "border-accent-green bg-accent-green/10"
                      : "border-text-muted/25 bg-bg-card-hover"
                  }`}
                  style={{ width: `${f.w}px`, height: `${f.h}px`, maxWidth: "48px", maxHeight: "52px" }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center gap-[3px] p-1.5">
                    <div className={`w-full h-[2px] rounded-full ${ratio === f.id ? "bg-accent-green/30" : "bg-text-muted/15"}`} />
                    <div className={`w-3/4 h-[2px] rounded-full ${ratio === f.id ? "bg-accent-green/20" : "bg-text-muted/10"}`} />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className={`block text-[11px] font-bold ${ratio === f.id ? "text-accent-green" : "text-text-secondary"}`}>{f.label}</span>
                <span className={`block text-[9px] ${ratio === f.id ? "text-accent-green/60" : "text-text-muted/60"}`}>{f.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Upload image */}
      <div>
        <h2 className="text-sm font-[600] text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center">3</span>
          Suba a foto do produto
        </h2>
        <div className="rounded-2xl card-base p-6">
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent-green/30 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = "image/*";
              input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
              input.click();
            }}
          >
            <svg className="w-8 h-8 mx-auto text-text-muted/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-text-secondary mb-1">Arraste fotos aqui ou clique para upload</p>
            <p className="text-xs text-text-muted">PNG, JPG, WebP — até 10 imagens por vez</p>
          </div>

          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles((prev) => prev.filter((_, idx) => idx !== i));
                      setPreviews((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-bg-deep/80 flex items-center justify-center text-xs text-text-muted hover:text-accent-rose"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Prompt preview + Process */}
      {selectedAction && previews.length > 0 && (
        <div>
          <h2 className="text-sm font-[600] text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center">4</span>
            Processar
          </h2>

          {/* Editable prompt */}
          <div className="p-3 rounded-xl bg-bg-elevated border border-border mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Prompt que será enviado:</span>
              <button
                onClick={() => {
                  if (!isEditing) {
                    setEditedPrompt(currentPrompt || basePrompt);
                  }
                  setIsEditing(!isEditing);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                  isEditing
                    ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/30"
                    : "text-text-muted hover:text-accent-amber"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                {isEditing ? "Salvar" : "Editar"}
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                rows={3}
                className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs font-mono leading-relaxed focus:outline-none transition-all resize-none"
              />
            ) : (
              <p className="text-xs text-text-secondary font-mono leading-relaxed">{currentPrompt}</p>
            )}
          </div>

          <button
            onClick={handleProcess}
            disabled={loading || !currentPrompt}
            className="btn-press px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Processar
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-[700] font-[var(--font-heading)] mb-4 tracking-tight">Resultados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, i) => (
              <div key={i} className="rounded-2xl card-base overflow-hidden">
                <div className="aspect-square bg-bg-card-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={`Resultado ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-2">
                  {/* Save to gallery */}
                  {!item.saved ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent-amber/[0.06] border border-accent-amber/15">
                      <svg className="w-4 h-4 text-accent-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                      <span className="text-[11px] text-accent-amber/80 flex-1">Salvar na galeria?</span>
                      <button
                        onClick={async () => {
                          setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saving: true } : r));
                          try {
                            await fetch("/api/gallery", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                imageUrl: item.url,
                                tool: "EDITOR",
                                prompt: item.prompt,
                                metadata: { action: selectedAction },
                              }),
                            });
                            setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saved: true, saving: false } : r));
                          } catch {
                            setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saving: false } : r));
                          }
                        }}
                        disabled={item.saving}
                        className="btn-press px-3 py-1 rounded-md text-[11px] font-bold bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors"
                      >
                        {item.saving ? "..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => setResults(prev => prev.map((r, idx) => idx === i ? { ...r, saved: true } : r))}
                        className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-accent-green/70">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Salvo na galeria
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a href={item.url} download target="_blank" className="btn-press flex-1 py-2.5 rounded-lg text-xs font-bold bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors text-center">
                      Download HD
                    </a>
                    <button className="btn-press flex-1 py-2.5 rounded-lg text-xs font-medium border border-border text-text-secondary hover:border-accent-green/30 hover:text-accent-green transition-colors">
                      Compartilhar
                    </button>
                  </div>

                  {/* Debug: prompt enviado */}
                  <details>
                    <summary className="text-[10px] text-text-muted cursor-pointer hover:text-text-secondary">
                      Ver prompt enviado
                    </summary>
                    <pre className="mt-1 p-2 rounded-lg bg-bg-deep border border-border text-[10px] font-mono text-text-muted whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {item.prompt}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl card-base overflow-hidden animate-pulse">
              <div className="aspect-square bg-bg-card-hover" />
              <div className="p-3 flex gap-2">
                <div className="flex-1 h-9 rounded-lg bg-bg-card-hover" />
                <div className="flex-1 h-9 rounded-lg bg-bg-card-hover" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
