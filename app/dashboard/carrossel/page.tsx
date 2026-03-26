"use client";

import { useState, useCallback } from "react";
import SlideEditor from "./SlideEditor";

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
  const [slideCount, setSlideCount] = useState(9);
  const [facePhotos, setFacePhotos] = useState<string[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [variations, setVariations] = useState<Slide[][]>([]);
  const [step, setStep] = useState<"select" | "choose" | "copy" | "editor" | "images">("select");

  const handleFaceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || facePhotos.length >= 2) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFacePhotos((prev) => [...prev, ev.target?.result as string]);
    reader.readAsDataURL(file);
  }, [facePhotos.length]);

  // Step 1: Generate copys only
  const handleGenerateCopy = async () => {
    if (!selectedTemplate) return;
    setLoadingCopy(true);

    try {
      const res = await fetch("/api/carrossel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          customTema: customTema || undefined,
          colors: primaryColor ? { primary: primaryColor, secondary1: secondary1 || undefined } : undefined,
          slideCount,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Erro: ${data.error}`);
        setLoadingCopy(false);
        return;
      }
      const vars: Slide[][] = (data.variations || []).map((v: Slide[]) =>
        v.map((s: Slide) => ({ ...s, imageUrl: "", generating: false }))
      );
      setVariations(vars);
      setStep("choose");
    } catch (err) {
      alert(`Erro: ${err}`);
    } finally {
      setLoadingCopy(false);
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

      {/* ====== STEP 1: Select template ====== */}
      {step === "select" && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Escolha um Template</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {templates.map((t) => (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                  className={`btn-press p-4 rounded-xl text-left transition-all ${selectedTemplate === t.id ? "card-featured border-accent-amber/30" : "card-base"}`}>
                  <span className="text-2xl">{t.icon}</span>
                  <h3 className={`text-xs font-bold mt-2 ${selectedTemplate === t.id ? "text-accent-amber" : "text-text-primary"}`}>{t.name}</h3>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card-base rounded-2xl p-6 space-y-4">
            {/* Custom tema */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                Personalize o tema <span className="font-normal normal-case tracking-normal text-text-muted/60">(opcional)</span>
              </label>
              <input type="text" value={customTema} onChange={(e) => setCustomTema(e.target.value)}
                placeholder="Ex: Promoção de Dia das Mães com foco em armações femininas premium"
                className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none text-sm" />
            </div>

            {/* Slide count */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Quantidade de slides</label>
              <div className="flex gap-2">
                {[3, 5, 7, 9].map((n) => (
                  <button key={n} onClick={() => setSlideCount(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${slideCount === n
                      ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/30"
                      : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary"}`}>
                    {n}
                  </button>
                ))}
              </div>
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

            <button onClick={handleGenerateCopy} disabled={!selectedTemplate || loadingCopy}
              className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-rose text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all disabled:opacity-40 flex items-center gap-2">
              {loadingCopy ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Gerando copys...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> Gerar Copys</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2: Choose variation ====== */}
      {step === "choose" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Escolha uma variação</h2>
              <p className="text-xs text-text-muted mt-0.5">Geradas {variations.length} opções. Leia e escolha a melhor.</p>
            </div>
            <button onClick={() => { setStep("select"); setVariations([]); }}
              className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
              Voltar
            </button>
          </div>

          <div className="space-y-5">
            {variations.map((v, idx) => {
              const toneLabels = ["Profissional", "Descontraído", "Emocional"];
              return (
                <div key={idx} className="card-base rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-accent-amber">Opção {idx + 1}</span>
                      <span className="text-[10px] text-text-muted bg-bg-deep px-2 py-0.5 rounded-md">{toneLabels[idx] || `Variação ${idx + 1}`}</span>
                    </div>
                    <span className="text-[10px] text-text-muted">{v.length} slides</span>
                  </div>
                  <div className="overflow-y-auto max-h-[50vh] rounded-xl bg-bg-deep border border-border p-4 space-y-4 scrollbar-thin">
                    {v.map((slide, si) => (
                      <div key={si} className="space-y-1 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                        <p className="text-xs font-bold text-text-primary">Slide {slide.order} — {slide.headline}</p>
                        <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap">{slide.body}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setSlides(v); setStep("copy"); }}
                    className="btn-press w-full py-3 rounded-xl bg-gradient-to-r from-accent-amber to-accent-rose text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all"
                  >
                    Escolher esta opção
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== STEP 3: Review copys + add face photo ====== */}
      {step === "copy" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Copys do Carrossel</h2>
              <p className="text-xs text-text-muted mt-0.5">Revise e edite os textos. Depois gere as imagens.</p>
            </div>
            <button onClick={() => setStep("choose")}
              className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
              Voltar
            </button>
          </div>

          {/* Face photo upload */}
          <div className="card-base rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Sua foto no carrossel <span className="font-normal normal-case tracking-normal text-text-muted/60">(opcional)</span>
              </label>
            </div>
            <div className="flex gap-3 items-center">
              {facePhotos.map((photo, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-accent-violet/30 bg-bg-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`Rosto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => setFacePhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-bg-deep/80 flex items-center justify-center text-accent-rose text-[8px]">✕</button>
                </div>
              ))}
              {facePhotos.length < 2 && (
                <label className="cursor-pointer group">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-accent-violet/30 hover:border-accent-violet/50 bg-bg-deep flex flex-col items-center justify-center gap-1 transition-all">
                    <svg className="w-4 h-4 text-accent-violet/50 group-hover:text-accent-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                    <span className="text-[8px] text-text-muted">Foto</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
                </label>
              )}
              <p className="text-[10px] text-text-muted flex-1">
                {facePhotos.length > 0 ? "Sua foto será usada como referência nas imagens do carrossel." : "Adicione sua foto para aparecer nos slides (igual ao FacePost)."}
              </p>
            </div>
          </div>

          {/* Slide copys list */}
          <div className="space-y-3">
            {slides.map((slide, i) => (
              <div key={i} className="card-base rounded-xl p-4 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-accent-amber/10 flex items-center justify-center text-accent-amber text-sm font-bold shrink-0">
                  {slide.order}
                </div>
                <div className="flex-1 space-y-2">
                  {editingSlide === i ? (
                    <>
                      <input value={slide.headline} onChange={(e) => updateSlideText(i, "headline", e.target.value)}
                        className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-sm font-bold focus:outline-none" />
                      <textarea value={slide.body} onChange={(e) => updateSlideText(i, "body", e.target.value)} rows={2}
                        className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none resize-none" />
                      <button onClick={() => setEditingSlide(null)} className="text-[10px] text-accent-green font-medium">Fechar</button>
                    </>
                  ) : (
                    <button onClick={() => setEditingSlide(i)} className="text-left w-full group">
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-amber transition-colors">{slide.headline}</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{slide.body}</p>
                      <span className="text-[9px] text-text-muted/40 group-hover:text-accent-amber/50 mt-1 block">Clique para editar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Go to editor */}
          <button onClick={() => setStep("editor")}
            className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
            Abrir Editor Visual
          </button>
        </div>
      )}

      {/* ====== STEP 3: Visual Editor ====== */}
      {step === "editor" && (
        <SlideEditor
          initialSlides={slides.map((s) => ({ order: s.order, headline: s.headline, body: s.body, imagePrompt: s.imagePrompt }))}
          onBack={() => setStep("copy")}
        />
      )}
    </div>
  );
}
