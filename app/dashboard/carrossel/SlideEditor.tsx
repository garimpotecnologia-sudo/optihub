"use client";

import { useState, useRef, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, Upload, Type, Palette, Layout, Sparkles, X, Save, AlertTriangle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

// ── Types ──
interface SlideData {
  order: number;
  headline: string;
  body: string;
  imageDescription: string;
  background: string | null; // null = gradient, string = URL or base64
  imagePrompt: string | null;
  generatingImage: boolean;
}

interface StylePreset {
  id: string;
  name: string;
  desc: string;
  headlineSize: number;
  headlineWeight: number;
  headlineAlign: "center" | "left";
  headlineTransform: "uppercase" | "none";
  bodySize: number;
  bodyAlign: "center" | "left";
  position: "center" | "bottom" | "bottom-bar";
  letterSpacing: string;
  lineHeight: number;
  overlay: (p: PaletteColors) => string;
}

interface PaletteColors {
  name: string;
  bg: string;
  accent: string;
  text: string;
  secondary: string;
}

interface FontOption {
  name: string;
  family: string;
}

// ── Presets ──
const STYLES: StylePreset[] = [
  {
    id: "impacto", name: "Impacto", desc: "Centralizado, uppercase, bold",
    headlineSize: 64, headlineWeight: 900, headlineAlign: "center", headlineTransform: "uppercase",
    bodySize: 28, bodyAlign: "center", position: "center", letterSpacing: "0.02em", lineHeight: 1.1,
    overlay: (p) => `linear-gradient(180deg, ${p.bg}dd 0%, ${p.bg}88 40%, ${p.bg}dd 100%)`,
  },
  {
    id: "editorial", name: "Editorial", desc: "Esquerda, storytelling, linha accent",
    headlineSize: 52, headlineWeight: 700, headlineAlign: "left", headlineTransform: "none",
    bodySize: 26, bodyAlign: "left", position: "bottom", letterSpacing: "0", lineHeight: 1.2,
    overlay: (p) => `linear-gradient(to top, ${p.bg}ee 0%, ${p.bg}bb 50%, transparent 100%)`,
  },
  {
    id: "moderno", name: "Moderno", desc: "Barra colorida accent, sem overlay",
    headlineSize: 52, headlineWeight: 800, headlineAlign: "left", headlineTransform: "uppercase",
    bodySize: 24, bodyAlign: "left", position: "bottom-bar", letterSpacing: "0.01em", lineHeight: 1.15,
    overlay: () => "none",
  },
];

const PALETTES: PaletteColors[] = [
  { name: "Escuro", bg: "#0a0a0a", accent: "#e11d48", text: "#ffffff", secondary: "#991b1b" },
  { name: "Terroso", bg: "#0a0a0a", accent: "#f4a261", text: "#ffffff", secondary: "#e76f51" },
  { name: "Neon", bg: "#0C1A14", accent: "#03FF94", text: "#ffffff", secondary: "#59D4D1" },
  { name: "Laranja", bg: "#0a0a0a", accent: "#f97316", text: "#ffffff", secondary: "#fb923c" },
  { name: "Azul", bg: "#0a1628", accent: "#3b82f6", text: "#ffffff", secondary: "#60a5fa" },
  { name: "Claro", bg: "#f5f0eb", accent: "#1a1a1a", text: "#111111", secondary: "#666666" },
];

const FONTS: FontOption[] = [
  { name: "Bebas Neue", family: "'Bebas Neue', cursive" },
  { name: "Anton", family: "'Anton', sans-serif" },
  { name: "Oswald", family: "'Oswald', sans-serif" },
  { name: "Playfair", family: "'Playfair Display', serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif" },
  { name: "Poppins", family: "'Poppins', sans-serif" },
  { name: "Archivo Black", family: "'Archivo Black', sans-serif" },
  { name: "DM Serif", family: "'DM Serif Display', serif" },
];

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Oswald:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Poppins:wght@400;700;900&family=Archivo+Black&family=DM+Serif+Display&display=swap');`;

// ── Component ──
interface SlideEditorProps {
  initialSlides: { order: number; headline: string; body: string; imagePrompt: string }[];
  theme: string;
  onBack: () => void;
}

export default function SlideEditor({ initialSlides, theme, onBack }: SlideEditorProps) {
  const [slides, setSlides] = useState<SlideData[]>(() =>
    initialSlides.map((s) => ({ ...s, imageDescription: s.imagePrompt, background: null, imagePrompt: null, generatingImage: false }))
  );
  const [activeSlide, setActiveSlide] = useState<number | null>(0);
  const [activeStyle, setActiveStyle] = useState(STYLES[0]);
  const [activePalette, setActivePalette] = useState(PALETTES[2]); // Neon default
  const [activeFont, setActiveFont] = useState(FONTS[0]); // Bebas Neue
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const slide = activeSlide !== null ? slides[activeSlide] : null;

  const updateSlide = useCallback((index: number, field: keyof SlideData, value: unknown) => {
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeSlide === null) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSlide(activeSlide, "background", ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [activeSlide, updateSlide]);

  // Generate image with AI for a specific slide
  const handleGenerateSlideImage = useCallback(async (index: number) => {
    const s = slides[index];
    if (!s) return;
    updateSlide(index, "generatingImage", true);

    try {
      const res = await fetch("/api/carrossel/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: [{ headline: s.headline, body: s.body, imageDescription: s.imageDescription }],
          theme,
          palette: `${activePalette.name}: bg ${activePalette.bg}, accent ${activePalette.accent}`,
          style: activeStyle.id,
        }),
      });
      const data = await res.json();
      const result = data.slides?.[0];
      if (result?.imageUrl) {
        updateSlide(index, "background", result.imageUrl);
        updateSlide(index, "imagePrompt", result.imagePrompt);
      }
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      updateSlide(index, "generatingImage", false);
    }
  }, [slides, theme, activePalette, activeStyle, updateSlide]);

  // Export single slide
  const exportSlide = useCallback(async (index: number) => {
    const el = slideRefs.current[index];
    if (!el) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const inner = el.querySelector("[data-slide-inner]") as HTMLElement;
      if (!inner) return;
      const prev = inner.style.transform;
      inner.style.transform = "none";
      const canvas = await html2canvas(inner, { width: 1080, height: 1350, scale: 1, useCORS: true, backgroundColor: null });
      inner.style.transform = prev;
      const link = document.createElement("a");
      link.download = `slide-${slides[index].order}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }, [slides]);

  const exportAll = useCallback(async () => {
    setExporting(true);
    for (let i = 0; i < slides.length; i++) {
      await exportSlide(i);
      await new Promise((r) => setTimeout(r, 500));
    }
    setExporting(false);
  }, [slides, exportSlide]);

  // Save to gallery
  const saveSlideToGallery = useCallback(async (index: number) => {
    const el = slideRefs.current[index];
    if (!el) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const inner = el.querySelector("[data-slide-inner]") as HTMLElement;
      if (!inner) return;
      const prev = inner.style.transform;
      inner.style.transform = "none";
      const canvas = await html2canvas(inner, { width: 1080, height: 1350, scale: 1, useCORS: true, backgroundColor: null });
      inner.style.transform = prev;
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const fileName = `carrossel/${user.id}/slide-${slides[index].order}-${Date.now()}.png`;
      await supabase.storage.from("generations").upload(fileName, blob, { contentType: "image/png" });
      const { data: urlData } = supabase.storage.from("generations").getPublicUrl(fileName);
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: urlData.publicUrl, tool: "CARROSSEL", prompt: slides[index].headline, metadata: { style: activeStyle.id, palette: activePalette.name } }),
      });
      setSavedCount((c) => c + 1);
    } finally {
      setSaving(false);
    }
  }, [slides, supabase, activeStyle, activePalette]);

  const saveAllToGallery = useCallback(async () => {
    setSaving(true); setSavedCount(0);
    for (let i = 0; i < slides.length; i++) await saveSlideToGallery(i);
    setSaving(false);
  }, [slides, saveSlideToGallery]);

  // Background style for a slide
  const slideBg = (s: SlideData): React.CSSProperties => {
    if (s.background) {
      const isUrl = s.background.startsWith("http") || s.background.startsWith("data:");
      return { backgroundImage: `url(${isUrl ? s.background : ""})`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    return { background: `linear-gradient(135deg, ${activePalette.bg} 0%, ${activePalette.secondary}33 50%, ${activePalette.bg} 100%)` };
  };

  const SCALE = 0.28;

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <div className="space-y-5 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold font-[var(--font-heading)]">Editor de Slides</h2>
            <p className="text-xs text-text-muted mt-0.5">{slides.length} slides · Clique para editar</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={onBack} className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">Voltar</button>
            <button onClick={saveAllToGallery} disabled={saving || exporting}
              className="px-4 py-2 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs font-bold hover:bg-accent-amber/20 transition-all disabled:opacity-40 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />{saving ? `Salvando ${savedCount}/${slides.length}...` : "Salvar na Galeria"}
            </button>
            <button onClick={exportAll} disabled={exporting || saving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep text-xs font-bold hover:shadow-[0_0_20px_rgba(3,255,148,0.2)] transition-all disabled:opacity-40 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />{exporting ? "Exportando..." : "Baixar Todos"}
            </button>
          </div>
        </div>

        {/* 30-day warning */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent-amber/5 border border-accent-amber/15">
          <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0" />
          <p className="text-[11px] text-text-muted"><span className="font-semibold text-accent-amber">Aviso:</span> Imagens na galeria ficam disponíveis por <span className="font-semibold text-text-primary">30 dias</span>. Baixe antes do prazo.</p>
        </div>

        {/* ── Toolbar: Style + Font + Palette ── */}
        <div className="card-base rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Style selector */}
            <div>
              <label className="block text-[10px] text-text-muted mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1"><Layout className="w-3 h-3" /> Estilo</label>
              <div className="flex gap-1.5">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setActiveStyle(s)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${activeStyle.id === s.id ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/30" : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary"}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font selector */}
            <div>
              <label className="block text-[10px] text-text-muted mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1"><Type className="w-3 h-3" /> Fonte</label>
              <div className="flex gap-1 overflow-x-auto">
                {FONTS.map((f) => (
                  <button key={f.name} onClick={() => setActiveFont(f)}
                    className={`shrink-0 px-2.5 py-2 rounded-lg text-[10px] font-bold transition-all ${activeFont.name === f.name ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/30" : "bg-bg-deep border border-border text-text-muted"}`}
                    style={{ fontFamily: f.family }}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Palette selector */}
            <div>
              <label className="block text-[10px] text-text-muted mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1"><Palette className="w-3 h-3" /> Paleta</label>
              <div className="flex gap-1.5">
                {PALETTES.map((p) => (
                  <button key={p.name} onClick={() => setActivePalette(p)} title={p.name}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activePalette.name === p.name ? "ring-2 ring-accent-amber ring-offset-1 ring-offset-bg-card" : "hover:scale-110"}`}
                    style={{ background: p.bg, border: `2px solid ${p.accent}` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Area: Slides + Panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Slides strip */}
          <div className="space-y-4">
            {/* Horizontal scroll of slide previews */}
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
              {slides.map((s, i) => (
                <div key={i} className="shrink-0 space-y-1.5">
                  <button onClick={() => setActiveSlide(i)}
                    ref={(el) => { slideRefs.current[i] = el; }}
                    className={`block rounded-xl overflow-hidden transition-all ${activeSlide === i ? "ring-2 ring-accent-amber shadow-xl" : "ring-1 ring-border/30 opacity-70 hover:opacity-100"}`}
                    style={{ width: 1080 * SCALE, height: 1350 * SCALE }}>
                    <div data-slide-inner style={{
                      width: 1080, height: 1350, transform: `scale(${SCALE})`, transformOrigin: "top left",
                      position: "relative", fontFamily: activeFont.family, ...slideBg(s),
                    }}>
                      {/* Overlay */}
                      {activeStyle.position !== "bottom-bar" && s.background && (
                        <div style={{ position: "absolute", inset: 0, background: activeStyle.overlay(activePalette), zIndex: 1 }} />
                      )}
                      {/* Bottom bar */}
                      {activeStyle.position === "bottom-bar" && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: activePalette.accent, zIndex: 1 }} />
                      )}
                      {/* Text */}
                      <div style={{
                        position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column",
                        padding: activeStyle.position === "bottom-bar" ? "60px 60px 60px" : "80px 60px",
                        justifyContent: activeStyle.position === "center" ? "center" : "flex-end",
                        alignItems: activeStyle.headlineAlign === "center" ? "center" : "flex-start",
                      }}>
                        {/* Editorial accent line */}
                        {activeStyle.id === "editorial" && (
                          <div style={{ width: 60, height: 4, background: activePalette.accent, marginBottom: 20, borderRadius: 2 }} />
                        )}
                        <h2 style={{
                          fontSize: activeStyle.headlineSize, fontWeight: activeStyle.headlineWeight,
                          color: activeStyle.position === "bottom-bar" ? activePalette.bg : activePalette.text,
                          textAlign: activeStyle.headlineAlign, textTransform: activeStyle.headlineTransform,
                          lineHeight: activeStyle.lineHeight, letterSpacing: activeStyle.letterSpacing,
                          marginBottom: 16, maxWidth: "100%", wordBreak: "break-word",
                        }}>
                          {s.headline}
                        </h2>
                        <p style={{
                          fontSize: activeStyle.bodySize, fontWeight: 400,
                          color: activeStyle.position === "bottom-bar" ? `${activePalette.bg}cc` : activePalette.secondary,
                          textAlign: activeStyle.bodyAlign, lineHeight: 1.5, maxWidth: "100%",
                        }}>
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </button>
                  {/* Slide number + download */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-accent-amber">Slide {s.order}</span>
                    <button onClick={(e) => { e.stopPropagation(); exportSlide(i); }} disabled={exporting}
                      className="p-1 rounded hover:bg-bg-card-hover text-text-muted hover:text-accent-green transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            {slides.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setActiveSlide(Math.max(0, (activeSlide || 0) - 1))} disabled={activeSlide === 0}
                  className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
                <span className="text-xs font-bold text-text-muted">
                  {activeSlide !== null ? `Slide ${slides[activeSlide]?.order} de ${slides.length}` : "Clique num slide"}
                </span>
                <button onClick={() => setActiveSlide(Math.min(slides.length - 1, (activeSlide || 0) + 1))} disabled={activeSlide === slides.length - 1}
                  className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          {/* ── Sidebar: Edit Panel ── */}
          {activeSlide !== null && slide && (
            <div className="card-base rounded-2xl p-4 space-y-4 h-fit sticky top-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-amber">Editando Slide {slide.order}</span>
                <button onClick={() => setActiveSlide(null)} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted"><X className="w-4 h-4" /></button>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-[10px] text-text-muted mb-1 uppercase tracking-wider">Headline</label>
                <textarea value={slide.headline} onChange={(e) => updateSlide(activeSlide, "headline", e.target.value)} rows={2}
                  className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs font-bold focus:outline-none resize-none" />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[10px] text-text-muted mb-1 uppercase tracking-wider">Texto de apoio</label>
                <textarea value={slide.body} onChange={(e) => updateSlide(activeSlide, "body", e.target.value)} rows={3}
                  className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none resize-none" />
              </div>

              {/* Image section */}
              <div className="space-y-2">
                <label className="block text-[10px] text-text-muted uppercase tracking-wider">Imagem de fundo</label>

                {slide.background && (
                  <div className="relative rounded-lg overflow-hidden aspect-[4/5] bg-bg-deep">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.background} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => updateSlide(activeSlide, "background", null)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-accent-rose/80 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 rounded-lg border border-dashed border-border hover:border-accent-green/30 text-[11px] text-text-muted hover:text-accent-green transition-colors flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> {slide.background ? "Trocar foto" : "Enviar foto"}
                  </button>
                  <button onClick={() => handleGenerateSlideImage(activeSlide)} disabled={slide.generatingImage}
                    className="flex-1 py-2.5 rounded-lg bg-accent-violet/10 border border-accent-violet/20 text-[11px] text-accent-violet font-semibold hover:bg-accent-violet/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40">
                    {slide.generatingImage ? (
                      <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Gerando...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> Gerar com IA</>
                    )}
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

                {/* AI image suggestion */}
                <p className="text-[9px] text-text-muted/50 italic leading-relaxed">
                  Sugestão da IA: {slide.imageDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
