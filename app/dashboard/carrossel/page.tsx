"use client";

import { useState } from "react";
import SlideEditor from "./SlideEditor";

interface SlideCopy {
  headline: string;
  body: string;
  imageDescription: string;
}

interface CopyVariation {
  slides: SlideCopy[];
}

export default function CarrosselPage() {
  const [theme, setTheme] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [variationA, setVariationA] = useState<CopyVariation | null>(null);
  const [variationB, setVariationB] = useState<CopyVariation | null>(null);
  const [selections, setSelections] = useState<("A" | "B")[]>([]);
  const [finalSlides, setFinalSlides] = useState<SlideCopy[]>([]);
  const [step, setStep] = useState<"setup" | "copySelect" | "editor">("setup");

  // ── Step 1: Generate copys ──
  const handleGenerate = async () => {
    if (!theme.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/carrossel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, slideCount }),
      });
      const data = await res.json();
      if (data.error) { alert(`Erro: ${data.error}`); return; }

      setVariationA(data.variationA);
      setVariationB(data.variationB);
      setSelections(new Array(data.variationA.slides.length).fill("A"));
      setStep("copySelect");
    } catch (err) {
      alert(`Erro: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Select per-slide and proceed ──
  const toggleSelection = (index: number) => {
    setSelections((prev) => prev.map((s, i) => i === index ? (s === "A" ? "B" : "A") : s));
  };

  const handleMontarVisual = () => {
    if (!variationA || !variationB) return;
    const merged = selections.map((sel, i) =>
      sel === "A" ? variationA.slides[i] : variationB.slides[i]
    );
    setFinalSlides(merged);
    setStep("editor");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">Carousel Maker</h1>
        <p className="text-text-secondary text-sm mt-1">Crie carrosséis completos para Instagram com IA.</p>
      </div>

      {/* ══════ STEP 1: Setup ══════ */}
      {step === "setup" && (
        <div className="space-y-6 animate-fade-up">
          <div className="card-base rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Tema do carrossel</label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Cuidados com a visão no verão — dicas de proteção UV para óculos de sol"
                rows={3}
                className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Quantidade de slides</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button key={n} onClick={() => setSlideCount(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${slideCount === n
                      ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/30"
                      : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!theme.trim() || loading}
              className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-rose text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all disabled:opacity-40 flex items-center gap-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Gerando copys...</>
              ) : "Gerar Copys"}
            </button>
          </div>
        </div>
      )}

      {/* ══════ STEP 2: Copy Selection A/B ══════ */}
      {step === "copySelect" && variationA && variationB && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Escolha as copys</h2>
              <p className="text-xs text-text-muted mt-0.5">Clique em cada slide para alternar entre variação A e B. Pode misturar.</p>
            </div>
            <button onClick={() => setStep("setup")}
              className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
              Voltar
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_1fr] gap-3">
            <div />
            <div className="text-center text-xs font-bold text-accent-amber uppercase tracking-wider">Variação A — Profissional</div>
            <div className="text-center text-xs font-bold text-accent-teal uppercase tracking-wider">Variação B — Descontraído</div>
          </div>

          {/* Slide rows */}
          <div className="space-y-3">
            {variationA.slides.map((slideA, i) => {
              const slideB = variationB.slides[i];
              const sel = selections[i];
              return (
                <div key={i} className="grid grid-cols-[40px_1fr_1fr] gap-3 items-stretch">
                  <div className="flex items-center justify-center">
                    <span className="w-8 h-8 rounded-lg bg-accent-amber/10 flex items-center justify-center text-accent-amber text-xs font-bold">{i + 1}</span>
                  </div>

                  {/* Variation A */}
                  <button onClick={() => toggleSelection(i)}
                    className={`p-4 rounded-xl text-left transition-all ${sel === "A"
                      ? "bg-accent-amber/10 border-2 border-accent-amber/40 shadow-lg"
                      : "card-base opacity-50 hover:opacity-75"}`}>
                    <h3 className="text-sm font-bold text-text-primary leading-snug">{slideA.headline}</h3>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{slideA.body}</p>
                    <p className="text-[9px] text-text-muted/40 mt-2 italic">{slideA.imageDescription}</p>
                  </button>

                  {/* Variation B */}
                  <button onClick={() => toggleSelection(i)}
                    className={`p-4 rounded-xl text-left transition-all ${sel === "B"
                      ? "bg-accent-teal/10 border-2 border-accent-teal/40 shadow-lg"
                      : "card-base opacity-50 hover:opacity-75"}`}>
                    <h3 className="text-sm font-bold text-text-primary leading-snug">{slideB?.headline}</h3>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{slideB?.body}</p>
                    <p className="text-[9px] text-text-muted/40 mt-2 italic">{slideB?.imageDescription}</p>
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={handleMontarVisual}
            className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
            Montar Visual
          </button>
        </div>
      )}

      {/* ══════ STEP 3: Visual Editor ══════ */}
      {step === "editor" && (
        <SlideEditor
          initialSlides={finalSlides.map((s, i) => ({ order: i + 1, headline: s.headline, body: s.body, imagePrompt: s.imageDescription }))}
          theme={theme}
          onBack={() => setStep("copySelect")}
        />
      )}
    </div>
  );
}
