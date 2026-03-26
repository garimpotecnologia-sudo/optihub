"use client";

import { useState, useCallback } from "react";

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
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "copy" | "images">("select");

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
      const initialSlides: Slide[] = (data.slides || []).map((s: Slide) => ({
        ...s,
        imageUrl: "",
        generating: false,
      }));
      setSlides(initialSlides);
      setStep("copy");
    } catch (err) {
      alert(`Erro: ${err}`);
    } finally {
      setLoadingCopy(false);
    }
  };

  // Step 2: Generate images for all slides
  const handleGenerateImages = async () => {
    setLoadingImages(true);
    setLoadingProgress(0);
    setStep("images");

    // Mark all as generating
    setSlides((prev) => prev.map((s) => ({ ...s, generating: true })));

    const hasFace = facePhotos.length > 0;

    for (let i = 0; i < slides.length; i += 3) {
      const batch = slides.slice(i, i + 3);
      const promises = batch.map(async (slide, batchIdx) => {
        const idx = i + batchIdx;
        try {
          const imgPrompt = hasFace
            ? `${slide.imagePrompt}\n\nINSTRUÇÃO CRÍTICA: Mantenha as características faciais exatamente iguais à imagem de referência fornecida.`
            : slide.imagePrompt;

          const imgRes = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: imgPrompt,
              tipo: "Post Feed",
              estilo: "Profissional",
              ratio: "1:1",
              tool: "CARROSSEL",
              referenceImage: hasFace ? facePhotos[0] : undefined,
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
    setLoadingImages(false);
  };

  const regenerateSlideImage = async (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, generating: true } : s));
    try {
      const hasFace = facePhotos.length > 0;
      const imgPrompt = hasFace
        ? `${slide.imagePrompt}\n\nINSTRUÇÃO CRÍTICA: Mantenha as características faciais exatamente iguais à imagem de referência fornecida.`
        : slide.imagePrompt;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imgPrompt, tipo: "Post Feed", estilo: "Profissional", ratio: "1:1", tool: "CARROSSEL", referenceImage: hasFace ? facePhotos[0] : undefined }),
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

      {/* ====== STEP 2: Review copys + add face photo ====== */}
      {step === "copy" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Copys do Carrossel</h2>
              <p className="text-xs text-text-muted mt-0.5">Revise e edite os textos. Depois gere as imagens.</p>
            </div>
            <button onClick={() => { setStep("select"); setSlides([]); }}
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

          {/* Generate images button */}
          <button onClick={handleGenerateImages} disabled={loadingImages}
            className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all disabled:opacity-40 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
            Gerar {slides.length} Imagens
          </button>
        </div>
      )}

      {/* ====== STEP 3: Images generated ====== */}
      {step === "images" && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Seu Carrossel</h2>
              <p className="text-xs text-text-muted mt-0.5">
                {loadingImages ? `Gerando imagens... ${loadingProgress}/${slides.length}` : "Pronto para download."}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("copy")} className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
                Editar copys
              </button>
              <button onClick={() => { setStep("select"); setSlides([]); setFacePhotos([]); }}
                className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
                Novo carrossel
              </button>
            </div>
          </div>

          {loadingImages && (
            <div className="h-1.5 rounded-full bg-bg-deep overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-rose transition-all duration-500"
                style={{ width: `${(loadingProgress / slides.length) * 100}%` }} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide, i) => (
              <div key={i} className="card-base rounded-2xl overflow-hidden">
                <div className="px-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-md">Slide {slide.order}</span>
                  {!slide.generating && slide.imageUrl && (
                    <div className="flex gap-1">
                      <button onClick={() => regenerateSlideImage(i)} className="p-1.5 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-accent-amber transition-colors" title="Regerar">
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

                <div className="aspect-square bg-bg-card-hover mx-4 mt-2 rounded-xl overflow-hidden">
                  {slide.generating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <svg className="w-6 h-6 animate-spin text-accent-amber/50" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[10px] text-text-muted">Gerando...</span>
                    </div>
                  ) : slide.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={slide.imageUrl} alt={`Slide ${slide.order}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><span className="text-xs text-text-muted">Sem imagem</span></div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-xs font-bold text-text-primary leading-snug">{slide.headline}</h3>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed line-clamp-2">{slide.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
