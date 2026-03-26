"use client";

import { useState } from "react";

interface Slide {
  order: number;
  headline: string;
  body: string;
  imagePrompt: string;
  imageUrl: string;
  generating: boolean;
}

const templates = [
  { id: "promocao", name: "Promoção Especial", desc: "Armações em oferta com urgência e CTAs", icon: "🏷️" },
  { id: "saude", name: "Saúde Ocular", desc: "Educativo sobre cuidados com a visão", icon: "👁️" },
  { id: "tendencias", name: "Tendências Eyewear", desc: "Formatos, cores e materiais em alta", icon: "✨" },
  { id: "antes_depois", name: "Antes e Depois", desc: "Transformação visual com óculos novos", icon: "🔄" },
  { id: "mitos", name: "Mitos vs Verdades", desc: "Desmistificando crenças sobre lentes", icon: "❓" },
  { id: "guia_armacoes", name: "Guia de Armações", desc: "Como escolher por formato de rosto", icon: "📐" },
  { id: "colecao", name: "Nova Coleção", desc: "Apresentação com storytelling de marca", icon: "🆕" },
  { id: "depoimentos", name: "Depoimentos", desc: "Clientes satisfeitos e prova social", icon: "⭐" },
  { id: "bastidores", name: "Bastidores da Ótica", desc: "Dia a dia, equipe e processo", icon: "🎬" },
  { id: "protecao_uv", name: "Proteção UV", desc: "Importância de lentes com proteção UV", icon: "☀️" },
];

export default function CarrosselPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customTema, setCustomTema] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondary1, setSecondary1] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "generating" | "preview">("select");

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    setStep("generating");
    setLoadingProgress(0);
    setSlides([]);

    try {
      // Step 1: Generate slide content (text + image prompts)
      setLoadingProgress(1);
      const res = await fetch("/api/carrossel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          customTema: customTema || undefined,
          colors: primaryColor ? { primary: primaryColor, secondary1: secondary1 || undefined } : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(`Erro: ${data.error}`);
        setStep("select");
        setLoading(false);
        return;
      }

      // Initialize slides with content but no images yet
      const initialSlides: Slide[] = data.slides.map((s: Slide) => ({
        ...s,
        imageUrl: "",
        generating: true,
      }));
      setSlides(initialSlides);
      setStep("preview");

      // Step 2: Generate images for each slide in parallel (batches of 3)
      for (let i = 0; i < initialSlides.length; i += 3) {
        const batch = initialSlides.slice(i, i + 3);
        const promises = batch.map(async (slide, batchIdx) => {
          const idx = i + batchIdx;
          try {
            const imgRes = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: slide.imagePrompt,
                tipo: "Post Feed",
                estilo: "Profissional",
                ratio: "1:1",
                tool: "CARROSSEL",
              }),
            });
            const imgData = await imgRes.json();
            if (imgData.imageUrl) {
              setSlides((prev) => prev.map((s, si) => si === idx ? { ...s, imageUrl: imgData.imageUrl, generating: false } : s));
            } else {
              setSlides((prev) => prev.map((s, si) => si === idx ? { ...s, generating: false } : s));
            }
          } catch {
            setSlides((prev) => prev.map((s, si) => si === idx ? { ...s, generating: false } : s));
          }
          setLoadingProgress(idx + 1);
        });
        await Promise.all(promises);
      }
    } catch (err) {
      alert(`Erro: ${err}`);
      setStep("select");
    } finally {
      setLoading(false);
    }
  };

  const regenerateSlideImage = async (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, generating: true } : s));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: slide.imagePrompt,
          tipo: "Post Feed",
          estilo: "Profissional",
          ratio: "1:1",
          tool: "CARROSSEL",
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSlides((prev) => prev.map((s, i) => i === index ? { ...s, imageUrl: data.imageUrl, generating: false } : s));
      }
    } catch {
      setSlides((prev) => prev.map((s, i) => i === index ? { ...s, generating: false } : s));
    }
  };

  const updateSlideText = (index: number, field: "headline" | "body", value: string) => {
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">Gerador de Carrosséis</h1>
        <p className="text-text-secondary text-sm mt-1">Crie carrosséis completos para Instagram com IA. Focado em ótica.</p>
      </div>

      {step === "select" && (
        <div className="space-y-6 animate-fade-up">
          {/* Template grid */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Escolha um Template</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`btn-press p-4 rounded-xl text-left transition-all ${
                    selectedTemplate === t.id
                      ? "card-featured border-accent-amber/30"
                      : "card-base"
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <h3 className={`text-xs font-bold mt-2 ${selectedTemplate === t.id ? "text-accent-amber" : "text-text-primary"}`}>
                    {t.name}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom tema */}
          <div className="card-base rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                Personalize o tema <span className="font-normal normal-case tracking-normal text-text-muted/60">(opcional)</span>
              </label>
              <input
                type="text"
                value={customTema}
                onChange={(e) => setCustomTema(e.target.value)}
                placeholder="Ex: Promoção de Dia das Mães com foco em armações femininas premium"
                className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none text-sm"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                Cores <span className="font-normal normal-case tracking-normal text-text-muted/60">(opcional)</span>
              </label>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <input type="color" value={primaryColor || "#03FF94"} onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-9 h-9 rounded-lg border-2 border-border" style={{ backgroundColor: primaryColor || "#1a3530" }} />
                  </label>
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="Primária" className="input-glow w-24 px-2 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs font-mono focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <input type="color" value={secondary1 || "#59D4D1"} onChange={(e) => setSecondary1(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-9 h-9 rounded-lg border-2 border-border" style={{ backgroundColor: secondary1 || "#1a3530" }} />
                  </label>
                  <input type="text" value={secondary1} onChange={(e) => setSecondary1(e.target.value)}
                    placeholder="Secundária" className="input-glow w-24 px-2 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs font-mono focus:outline-none" />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedTemplate || loading}
              className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-rose text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Gerar Carrossel (9 slides)
            </button>
          </div>
        </div>
      )}

      {/* Generating state */}
      {step === "generating" && slides.length === 0 && (
        <div className="card-base rounded-2xl p-10 flex flex-col items-center gap-4 animate-fade-up">
          <svg className="w-8 h-8 animate-spin text-accent-amber" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-text-secondary">Gerando conteúdo dos 9 slides...</p>
        </div>
      )}

      {/* Preview / Edit */}
      {(step === "preview" || (step === "generating" && slides.length > 0)) && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Seu Carrossel</h2>
              <p className="text-xs text-text-muted mt-0.5">
                {loading ? `Gerando imagens... ${loadingProgress}/9` : "Clique no texto para editar. Pronto para download."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep("select"); setSlides([]); }}
                className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors"
              >
                Novo carrossel
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="h-1.5 rounded-full bg-bg-deep overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-rose transition-all duration-500"
                style={{ width: `${(loadingProgress / 9) * 100}%` }} />
            </div>
          )}

          {/* Slides grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide, i) => (
              <div key={i} className="card-base rounded-2xl overflow-hidden">
                {/* Slide number */}
                <div className="px-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-md">
                    Slide {slide.order}
                  </span>
                  {!slide.generating && slide.imageUrl && (
                    <div className="flex gap-1">
                      <button onClick={() => regenerateSlideImage(i)} className="p-1.5 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-accent-amber transition-colors" title="Regerar imagem">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                      </button>
                      <a href={slide.imageUrl} download={`slide-${slide.order}.png`} target="_blank" className="p-1.5 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-accent-green transition-colors" title="Download">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="aspect-square bg-bg-card-hover mx-4 mt-2 rounded-xl overflow-hidden">
                  {slide.generating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <svg className="w-6 h-6 animate-spin text-accent-amber/50" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[10px] text-text-muted">Gerando imagem...</span>
                    </div>
                  ) : slide.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={slide.imageUrl} alt={`Slide ${slide.order}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-text-muted">Sem imagem</span>
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div className="p-4 space-y-2">
                  {editingSlide === i ? (
                    <>
                      <input
                        value={slide.headline}
                        onChange={(e) => updateSlideText(i, "headline", e.target.value)}
                        className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs font-bold focus:outline-none"
                      />
                      <textarea
                        value={slide.body}
                        onChange={(e) => updateSlideText(i, "body", e.target.value)}
                        rows={2}
                        className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-[11px] focus:outline-none resize-none"
                      />
                      <button onClick={() => setEditingSlide(null)} className="text-[10px] text-accent-green font-medium">Fechar</button>
                    </>
                  ) : (
                    <button onClick={() => setEditingSlide(i)} className="text-left w-full group">
                      <h3 className="text-xs font-bold text-text-primary group-hover:text-accent-amber transition-colors leading-snug">
                        {slide.headline}
                      </h3>
                      <p className="text-[11px] text-text-muted mt-1 leading-relaxed line-clamp-2">{slide.body}</p>
                      <span className="text-[9px] text-text-muted/50 mt-1 block group-hover:text-accent-amber/50">Clique para editar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
