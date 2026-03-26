"use client";

import { useState, useRef, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, Upload, Type, Palette, Layout } from "lucide-react";

// ── Types ──
interface SlideData {
  order: number;
  headline: string;
  body: string;
  imagePrompt: string;
  background: string | null; // null = gradient, string = base64 image
}

interface StylePreset {
  id: string;
  name: string;
  headlineSize: number;
  bodySize: number;
  headlineAlign: "left" | "center" | "right";
  headlineTransform: "uppercase" | "capitalize" | "none";
  position: "center" | "bottom" | "bottom-bar";
  overlay: (p: PaletteColors) => string;
}

interface PaletteColors {
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
    id: "impacto",
    name: "Impacto",
    headlineSize: 64,
    bodySize: 28,
    headlineAlign: "center",
    headlineTransform: "uppercase",
    position: "center",
    overlay: (p) => `linear-gradient(180deg, ${p.bg}cc 0%, ${p.bg}88 40%, ${p.bg}cc 100%)`,
  },
  {
    id: "editorial",
    name: "Editorial",
    headlineSize: 52,
    bodySize: 26,
    headlineAlign: "left",
    headlineTransform: "capitalize",
    position: "bottom",
    overlay: (p) => `linear-gradient(to top, ${p.bg}ee 0%, ${p.bg}aa 40%, transparent 100%)`,
  },
  {
    id: "bottom-bar",
    name: "Barra Inferior",
    headlineSize: 52,
    bodySize: 24,
    headlineAlign: "center",
    headlineTransform: "uppercase",
    position: "bottom-bar",
    overlay: () => "none",
  },
];

const PALETTES: (PaletteColors & { name: string })[] = [
  { name: "Escuro", bg: "#0a0a0a", accent: "#03FF94", text: "#ffffff", secondary: "#888888" },
  { name: "Neon", bg: "#0C1A14", accent: "#03FF94", text: "#ffffff", secondary: "#59D4D1" },
  { name: "Claro", bg: "#f5f5f5", accent: "#1a1a1a", text: "#111111", secondary: "#666666" },
  { name: "Azul Pro", bg: "#0a1628", accent: "#3b82f6", text: "#ffffff", secondary: "#94a3b8" },
  { name: "Sunset", bg: "#1a0a0a", accent: "#f97316", text: "#ffffff", secondary: "#fb923c" },
  { name: "Roxo", bg: "#0f0a1a", accent: "#a855f7", text: "#ffffff", secondary: "#c084fc" },
];

const FONTS: FontOption[] = [
  { name: "Inter", family: "'Inter', sans-serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif" },
  { name: "Playfair", family: "'Playfair Display', serif" },
  { name: "Oswald", family: "'Oswald', sans-serif" },
  { name: "Bebas Neue", family: "'Bebas Neue', cursive" },
];

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Oswald:wght@400;700&family=Bebas+Neue&display=swap');`;

// ── Component ──
interface SlideEditorProps {
  initialSlides: { order: number; headline: string; body: string; imagePrompt: string }[];
  onBack: () => void;
}

export default function SlideEditor({ initialSlides, onBack }: SlideEditorProps) {
  const [slides, setSlides] = useState<SlideData[]>(() =>
    initialSlides.map((s) => ({ ...s, background: null }))
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeStyle, setActiveStyle] = useState(STYLES[0]);
  const [activePalette, setActivePalette] = useState(PALETTES[0]);
  const [activeFont, setActiveFont] = useState(FONTS[0]);
  const [sidebarTab, setSidebarTab] = useState<"text" | "style" | "palette">("text");
  const [exporting, setExporting] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slide = slides[activeSlide];

  const updateSlide = useCallback((field: keyof SlideData, value: string | null) => {
    setSlides((prev) => prev.map((s, i) => i === activeSlide ? { ...s, [field]: value } : s));
  }, [activeSlide]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSlide("background", ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [updateSlide]);

  const exportSlide = useCallback(async (index: number) => {
    const el = slideRefs.current[index];
    if (!el) return;

    setExporting(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;
      const inner = el.querySelector("[data-slide-inner]") as HTMLElement;
      if (!inner) return;

      // Remove scale for capture
      const prev = inner.style.transform;
      inner.style.transform = "none";

      const canvas = await html2canvas(inner, {
        width: 1080,
        height: 1350,
        scale: 1,
        useCORS: true,
        backgroundColor: null,
      });

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
      // Small delay between downloads
      await new Promise((r) => setTimeout(r, 300));
    }
    setExporting(false);
  }, [slides, exportSlide]);

  // Background CSS for a slide
  const slideBg = (s: SlideData) => {
    if (s.background) return { backgroundImage: `url(${s.background})`, backgroundSize: "cover", backgroundPosition: "center" };
    return { background: `linear-gradient(135deg, ${activePalette.bg} 0%, ${activePalette.accent}22 50%, ${activePalette.bg} 100%)` };
  };

  // Text positioning
  const textPosition = () => {
    if (activeStyle.position === "center") return "items-center justify-center text-center";
    if (activeStyle.position === "bottom" || activeStyle.position === "bottom-bar") return "items-center justify-end text-center";
    return "items-center justify-center text-center";
  };

  const SCALE = 0.28;

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-[var(--font-heading)]">Editor de Slides</h2>
            <p className="text-xs text-text-muted mt-0.5">{slides.length} slides · Clique para editar · Personalize estilo, fonte e cores</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
              Voltar
            </button>
            <button onClick={exportAll} disabled={exporting}
              className="btn-press px-6 py-2 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep text-xs font-bold hover:shadow-[0_0_20px_rgba(3,255,148,0.2)] transition-all disabled:opacity-40 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {exporting ? "Exportando..." : "Baixar Todos"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ── Slides Grid ── */}
          <div className="space-y-4">
            {/* Slide thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slides.map((s, i) => (
                <button key={i} onClick={() => setActiveSlide(i)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === activeSlide ? "border-accent-amber shadow-lg" : "border-border/50 opacity-60 hover:opacity-90"}`}
                  style={{ width: 1080 * 0.08, height: 1350 * 0.08 }}>
                  <div style={{ width: 1080, height: 1350, transform: `scale(${0.08})`, transformOrigin: "top left", ...slideBg(s) }}
                    className="relative">
                    {s.background && (
                      <div className="absolute inset-0" style={{ background: activeStyle.overlay(activePalette) }} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} disabled={activeSlide === 0}
                className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-xs font-bold text-accent-amber">Slide {(slide?.order || 0)} de {slides.length}</span>
              <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} disabled={activeSlide === slides.length - 1}
                className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Active slide preview */}
            {slide && (
              <div className="flex justify-center">
                <div ref={(el) => { slideRefs.current[activeSlide] = el; }}
                  className="rounded-2xl overflow-hidden shadow-2xl border border-border/30"
                  style={{ width: 1080 * SCALE, height: 1350 * SCALE }}>
                  <div data-slide-inner
                    style={{
                      width: 1080,
                      height: 1350,
                      transform: `scale(${SCALE})`,
                      transformOrigin: "top left",
                      position: "relative",
                      fontFamily: activeFont.family,
                      ...slideBg(slide),
                    }}>
                    {/* Overlay */}
                    {activeStyle.position !== "bottom-bar" && (
                      <div className="absolute inset-0" style={{ background: activeStyle.overlay(activePalette) }} />
                    )}

                    {/* Text content */}
                    <div className={`absolute inset-0 flex flex-col ${textPosition()} p-16`}
                      style={{ zIndex: 2 }}>
                      {activeStyle.position === "bottom-bar" && <div className="flex-1" />}
                      <h2 style={{
                        fontSize: activeStyle.headlineSize,
                        fontWeight: 900,
                        color: activePalette.text,
                        textAlign: activeStyle.headlineAlign,
                        textTransform: activeStyle.headlineTransform,
                        lineHeight: 1.1,
                        marginBottom: 20,
                        maxWidth: "100%",
                        wordBreak: "break-word",
                      }}>
                        {slide.headline}
                      </h2>
                      <p style={{
                        fontSize: activeStyle.bodySize,
                        fontWeight: 400,
                        color: activePalette.secondary,
                        textAlign: activeStyle.headlineAlign,
                        lineHeight: 1.5,
                        maxWidth: "100%",
                      }}>
                        {slide.body}
                      </p>
                    </div>

                    {/* Bottom bar */}
                    {activeStyle.position === "bottom-bar" && (
                      <div className="absolute bottom-0 left-0 right-0" style={{
                        height: 180,
                        background: activePalette.accent,
                        zIndex: 1,
                      }} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Download single */}
            <div className="flex justify-center">
              <button onClick={() => exportSlide(activeSlide)} disabled={exporting}
                className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs font-medium hover:text-accent-green hover:border-accent-green/30 transition-colors flex items-center gap-1.5 disabled:opacity-40">
                <Download className="w-3.5 h-3.5" />
                Baixar slide {slide?.order}
              </button>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-bg-deep">
              {([
                { id: "text" as const, icon: Type, label: "Texto" },
                { id: "style" as const, icon: Layout, label: "Estilo" },
                { id: "palette" as const, icon: Palette, label: "Visual" },
              ]).map((tab) => (
                <button key={tab.id} onClick={() => setSidebarTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    sidebarTab === tab.id ? "bg-bg-card text-text-primary shadow" : "text-text-muted hover:text-text-secondary"
                  }`}>
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              ))}
            </div>

            {/* Text tab */}
            {sidebarTab === "text" && slide && (
              <div className="card-base rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1.5 uppercase tracking-wider">Headline</label>
                  <textarea value={slide.headline} onChange={(e) => updateSlide("headline", e.target.value)} rows={2}
                    className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs font-bold focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1.5 uppercase tracking-wider">Texto de apoio</label>
                  <textarea value={slide.body} onChange={(e) => updateSlide("body", e.target.value)} rows={3}
                    className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1.5 uppercase tracking-wider">Imagem de fundo</label>
                  <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 rounded-lg border border-dashed border-border hover:border-accent-green/30 text-[11px] text-text-muted hover:text-accent-green transition-colors flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> {slide.background ? "Trocar foto" : "Enviar foto"}
                    </button>
                    {slide.background && (
                      <button onClick={() => updateSlide("background", null)}
                        className="px-3 py-2 rounded-lg border border-border text-[11px] text-text-muted hover:text-accent-rose transition-colors">
                        Remover
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            )}

            {/* Style tab */}
            {sidebarTab === "style" && (
              <div className="card-base rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-wider">Layout do texto</label>
                  <div className="space-y-2">
                    {STYLES.map((s) => (
                      <button key={s.id} onClick={() => setActiveStyle(s)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${activeStyle.id === s.id ? "bg-accent-amber/10 border border-accent-amber/30" : "bg-bg-deep border border-border hover:border-border"}`}>
                        <span className={`text-xs font-bold ${activeStyle.id === s.id ? "text-accent-amber" : "text-text-primary"}`}>{s.name}</span>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {s.position === "center" ? "Texto centralizado" : s.position === "bottom" ? "Texto na base" : "Barra colorida inferior"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-wider">Fonte</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map((f) => (
                      <button key={f.name} onClick={() => setActiveFont(f)}
                        className={`p-2.5 rounded-lg text-center transition-all ${activeFont.name === f.name ? "bg-accent-amber/10 border border-accent-amber/30 text-accent-amber" : "bg-bg-deep border border-border text-text-muted hover:text-text-primary"}`}
                        style={{ fontFamily: f.family }}>
                        <span className="text-xs font-bold">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Palette tab */}
            {sidebarTab === "palette" && (
              <div className="card-base rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-wider">Paleta de cores</label>
                  <div className="space-y-2">
                    {PALETTES.map((p) => (
                      <button key={p.name} onClick={() => setActivePalette(p)}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${activePalette.name === p.name ? "bg-accent-amber/10 border border-accent-amber/30" : "bg-bg-deep border border-border"}`}>
                        <div className="flex gap-1">
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: p.bg, border: "1px solid #333" }} />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: p.accent }} />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: p.text, border: "1px solid #333" }} />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: p.secondary }} />
                        </div>
                        <span className={`text-xs font-bold ${activePalette.name === p.name ? "text-accent-amber" : "text-text-primary"}`}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
