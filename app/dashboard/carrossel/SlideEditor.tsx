"use client";

import { useState, useRef, useCallback } from "react";
import {
  Download, ChevronLeft, ChevronRight, Upload, Type, Palette as PaletteIcon,
  Layout, Sparkles, Save, AlertTriangle, Trash2, Layers, SlidersHorizontal,
  ImageIcon, RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import {
  STYLES, PALETTES, FONTS, GRADIENTS, MASKS, getGoogleFontsUrl,
  type StylePreset, type PaletteColors, type FontOption, type MaskPreset,
} from "./presets";

// ── Types ──
interface SlideData {
  order: number;
  headline: string;
  body: string;
  imageDescription: string;
  background: string | null;
  imagePrompt: string | null;
  generatingImage: boolean;
  maskId: string;
  maskColor: string;
  maskOpacity: number;
}

interface SlideEditorProps {
  initialSlides: { order: number; headline: string; body: string; imagePrompt: string; background: string | null }[];
  theme: string;
  onBack: () => void;
}

export default function SlideEditor({ initialSlides, theme, onBack }: SlideEditorProps) {
  const [slides, setSlides] = useState<SlideData[]>(() =>
    initialSlides.map((s) => ({
      ...s,
      imageDescription: s.imagePrompt,
      background: s.background || null,
      imagePrompt: null,
      generatingImage: false,
      maskId: "gradient-bottom",
      maskColor: "#000000",
      maskOpacity: 0.7,
    }))
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeStyle, setActiveStyle] = useState<StylePreset>(STYLES[0]);
  const [activePalette, setActivePalette] = useState<PaletteColors>(PALETTES[2]);
  const [activeFont, setActiveFont] = useState<FontOption>(FONTS[0]);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const slide = slides[currentIdx];
  const currentMask = MASKS.find((m) => m.id === slide.maskId) || MASKS[0];

  const updateSlide = useCallback((index: number, updates: Partial<SlideData>) => {
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSlide(currentIdx, { background: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [currentIdx, updateSlide]);

  const handleGenerateSlideImage = useCallback(async (index: number) => {
    const s = slides[index];
    if (!s) return;
    updateSlide(index, { generatingImage: true });
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
        updateSlide(index, { background: result.imageUrl, imagePrompt: result.imagePrompt });
      }
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      updateSlide(index, { generatingImage: false });
    }
  }, [slides, theme, activePalette, activeStyle, updateSlide]);

  // Export
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

  // Gallery
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
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b: Blob | null) => resolve(b!), "image/png"));
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

  // Background CSS
  const slideBgStyle = (s: SlideData, index: number): React.CSSProperties => {
    if (s.background) {
      return { backgroundImage: `url(${s.background})`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    const gradientFn = GRADIENTS[index % GRADIENTS.length];
    return { background: gradientFn(activePalette) };
  };

  // Mask CSS for a slide
  const maskStyle = (s: SlideData): string => {
    const mask = MASKS.find((m) => m.id === s.maskId) || MASKS[0];
    return mask.build(s.maskColor, s.maskOpacity);
  };

  const PREVIEW_SCALE = 0.42;
  const THUMB_SCALE = 0.12;

  const goTo = (idx: number) => setCurrentIdx(Math.max(0, Math.min(slides.length - 1, idx)));

  return (
    <>
      <style>{`@import url('${getGoogleFontsUrl()}');`}</style>
      <div className="space-y-4 animate-fade-up">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="px-3 py-1.5 rounded-lg border border-border text-text-muted text-xs font-medium hover:text-text-primary transition-colors">
              Voltar
            </button>
            <h2 className="text-base font-bold font-[var(--font-heading)]">Editor de Slides</h2>
            <span className="text-[10px] text-text-muted bg-bg-deep px-2 py-0.5 rounded-md">{slides.length} slides</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveAllToGallery} disabled={saving || exporting}
              className="px-3 py-1.5 rounded-lg bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-[11px] font-bold hover:bg-accent-amber/20 transition-all disabled:opacity-40 flex items-center gap-1.5">
              <Save className="w-3 h-3" />{saving ? `${savedCount}/${slides.length}` : "Galeria"}
            </button>
            <button onClick={() => exportSlide(currentIdx)} disabled={exporting || saving}
              className="px-3 py-1.5 rounded-lg border border-border text-text-muted text-[11px] font-medium hover:text-accent-green transition-colors flex items-center gap-1.5 disabled:opacity-40">
              <Download className="w-3 h-3" /> Slide
            </button>
            <button onClick={exportAll} disabled={exporting || saving}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep text-[11px] font-bold hover:shadow-[0_0_20px_rgba(3,255,148,0.2)] transition-all disabled:opacity-40 flex items-center gap-1.5">
              <Download className="w-3 h-3" />{exporting ? "Exportando..." : "Baixar Todos"}
            </button>
          </div>
        </div>

        {/* 30-day warning */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-amber/5 border border-accent-amber/15">
          <AlertTriangle className="w-3.5 h-3.5 text-accent-amber shrink-0" />
          <p className="text-[10px] text-text-muted"><span className="font-semibold text-accent-amber">Aviso:</span> Imagens na galeria ficam 30 dias. Baixe antes.</p>
        </div>

        {/* ── Main layout: Preview + Controls ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">

          {/* ════ LEFT: Big Preview ════ */}
          <div className="space-y-4">
            {/* Central preview */}
            <div className="flex justify-center">
              <div
                ref={(el) => { slideRefs.current[currentIdx] = el; }}
                className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/20"
                style={{ width: 1080 * PREVIEW_SCALE, height: 1350 * PREVIEW_SCALE }}
              >
                <div
                  data-slide-inner
                  style={{
                    width: 1080, height: 1350,
                    transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left",
                    position: "relative", fontFamily: activeFont.family,
                    ...slideBgStyle(slide, currentIdx),
                  }}
                >
                  {/* Máscara de cor */}
                  <div style={{ position: "absolute", inset: 0, background: maskStyle(slide), zIndex: 1 }} />

                  {/* Bottom bar (estilo moderno) */}
                  {activeStyle.position === "bottom-bar" && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: activePalette.accent, zIndex: 2 }} />
                  )}

                  {/* Texto sobre foto */}
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column",
                    padding: activeStyle.position === "bottom-bar" ? "60px 60px 60px" : "80px 60px",
                    justifyContent: activeStyle.position === "center" ? "center" : "flex-end",
                    alignItems: activeStyle.headlineAlign === "center" ? "center" : "flex-start",
                  }}>
                    {activeStyle.id === "editorial" && (
                      <div style={{ width: 60, height: 4, background: activePalette.accent, marginBottom: 20, borderRadius: 2 }} />
                    )}
                    <h2 style={{
                      fontSize: activeStyle.headlineSize, fontWeight: activeStyle.headlineWeight,
                      color: activeStyle.position === "bottom-bar" ? activePalette.bg : activePalette.text,
                      textAlign: activeStyle.headlineAlign, textTransform: activeStyle.headlineTransform,
                      lineHeight: activeStyle.lineHeight, letterSpacing: activeStyle.letterSpacing,
                      marginBottom: 16, maxWidth: "100%", wordBreak: "break-word",
                      textShadow: activeStyle.position !== "bottom-bar" ? "0 2px 8px rgba(0,0,0,0.5)" : "none",
                    }}>
                      {slide.headline}
                    </h2>
                    <p style={{
                      fontSize: activeStyle.bodySize, fontWeight: 400,
                      color: activeStyle.position === "bottom-bar" ? `${activePalette.bg}cc` : `${activePalette.text}cc`,
                      textAlign: activeStyle.bodyAlign, lineHeight: 1.5, maxWidth: "100%",
                      textShadow: activeStyle.position !== "bottom-bar" ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                    }}>
                      {slide.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation + slide count */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0}
                className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-text-muted">
                Slide {slide.order} de {slides.length}
              </span>
              <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === slides.length - 1}
                className="p-2 rounded-lg hover:bg-bg-card-hover text-text-muted disabled:opacity-30 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  ref={(el) => { if (i !== currentIdx) slideRefs.current[i] = el; }}
                  className={`shrink-0 rounded-lg overflow-hidden transition-all ${
                    i === currentIdx
                      ? "ring-2 ring-accent-amber shadow-lg scale-105"
                      : "ring-1 ring-border/20 opacity-60 hover:opacity-100"
                  }`}
                  style={{ width: 1080 * THUMB_SCALE, height: 1350 * THUMB_SCALE }}
                >
                  <div
                    data-slide-inner
                    style={{
                      width: 1080, height: 1350,
                      transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left",
                      position: "relative", fontFamily: activeFont.family,
                      ...slideBgStyle(s, i),
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, background: maskStyle(s), zIndex: 1 }} />
                    {activeStyle.position === "bottom-bar" && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: activePalette.accent, zIndex: 2 }} />
                    )}
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column",
                      padding: activeStyle.position === "bottom-bar" ? "60px 60px 60px" : "80px 60px",
                      justifyContent: activeStyle.position === "center" ? "center" : "flex-end",
                      alignItems: activeStyle.headlineAlign === "center" ? "center" : "flex-start",
                    }}>
                      {activeStyle.id === "editorial" && (
                        <div style={{ width: 60, height: 4, background: activePalette.accent, marginBottom: 20, borderRadius: 2 }} />
                      )}
                      <h2 style={{
                        fontSize: activeStyle.headlineSize, fontWeight: activeStyle.headlineWeight,
                        color: activeStyle.position === "bottom-bar" ? activePalette.bg : activePalette.text,
                        textAlign: activeStyle.headlineAlign, textTransform: activeStyle.headlineTransform,
                        lineHeight: activeStyle.lineHeight, letterSpacing: activeStyle.letterSpacing,
                        maxWidth: "100%", wordBreak: "break-word",
                      }}>
                        {s.headline}
                      </h2>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ════ RIGHT: Controls Panel ════ */}
          <div className="space-y-3">

            {/* ── Imagem de fundo ── */}
            <div className="card-base rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Imagem
                </label>
                {slide.background && (
                  <button onClick={() => updateSlide(currentIdx, { background: null })}
                    className="text-[9px] text-text-muted hover:text-accent-rose transition-colors flex items-center gap-1">
                    <Trash2 className="w-2.5 h-2.5" /> Remover
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 rounded-lg border border-dashed border-border hover:border-accent-green/40 text-[11px] text-text-muted hover:text-accent-green transition-all flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> {slide.background ? "Trocar" : "Enviar"}
                </button>
                <button onClick={() => handleGenerateSlideImage(currentIdx)} disabled={slide.generatingImage}
                  className="flex-1 py-2.5 rounded-lg bg-accent-violet/10 border border-accent-violet/20 text-[11px] text-accent-violet font-semibold hover:bg-accent-violet/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40">
                  {slide.generatingImage ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Gerar IA</>
                  )}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* ── Máscara ── */}
            <div className="card-base rounded-xl p-3 space-y-3">
              <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3" /> Máscara
              </label>

              {/* Mask type selector */}
              <div className="grid grid-cols-3 gap-1.5">
                {MASKS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateSlide(currentIdx, { maskId: m.id })}
                    className={`py-1.5 px-2 rounded-lg text-[9px] font-bold transition-all ${
                      slide.maskId === m.id
                        ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/30"
                        : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary"
                    }`}
                    title={m.desc}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {/* Mask color */}
              {slide.maskId !== "none" && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-text-muted w-8 shrink-0">Cor</label>
                    <div className="flex gap-1.5 flex-1">
                      {["#000000", activePalette.bg, activePalette.accent, activePalette.secondary, "#1a1a2e", "#0d1b2a"].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateSlide(currentIdx, { maskColor: c })}
                          className={`w-6 h-6 rounded-md transition-all ${slide.maskColor === c ? "ring-2 ring-accent-amber ring-offset-1 ring-offset-bg-card scale-110" : "hover:scale-110"}`}
                          style={{ background: c, border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      ))}
                      <input
                        type="color"
                        value={slide.maskColor}
                        onChange={(e) => updateSlide(currentIdx, { maskColor: e.target.value })}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Mask opacity */}
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-text-muted w-8 shrink-0">
                      <SlidersHorizontal className="w-3 h-3 inline" />
                    </label>
                    <input
                      type="range"
                      min="0" max="100" step="5"
                      value={Math.round(slide.maskOpacity * 100)}
                      onChange={(e) => updateSlide(currentIdx, { maskOpacity: Number(e.target.value) / 100 })}
                      className="flex-1 h-1.5 accent-accent-amber"
                    />
                    <span className="text-[9px] text-text-muted w-8 text-right font-mono">
                      {Math.round(slide.maskOpacity * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ── Estilo ── */}
            <div className="card-base rounded-xl p-3 space-y-2.5">
              <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                <Layout className="w-3 h-3" /> Estilo
              </label>
              <div className="flex gap-1.5">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setActiveStyle(s)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      activeStyle.id === s.id
                        ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/30"
                        : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary"
                    }`}>
                    <div>{s.name}</div>
                    <div className="text-[8px] font-normal opacity-60 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Fonte ── */}
            <div className="card-base rounded-xl p-3 space-y-2.5">
              <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                <Type className="w-3 h-3" /> Fonte
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {FONTS.map((f) => (
                  <button key={f.name} onClick={() => setActiveFont(f)}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                      activeFont.name === f.name
                        ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/30"
                        : "bg-bg-deep border border-border text-text-muted"
                    }`}
                    style={{ fontFamily: f.family }}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Paleta ── */}
            <div className="card-base rounded-xl p-3 space-y-2.5">
              <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                <PaletteIcon className="w-3 h-3" /> Paleta
              </label>
              <div className="flex gap-2">
                {PALETTES.map((p) => (
                  <button key={p.name} onClick={() => setActivePalette(p)} title={p.name}
                    className={`flex-1 py-2.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      activePalette.name === p.name
                        ? "ring-2 ring-accent-amber ring-offset-1 ring-offset-bg-card"
                        : "hover:scale-105"
                    }`}
                    style={{ background: p.bg, border: `2px solid ${p.accent}` }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: p.accent }} />
                    <span className="text-[8px] font-bold" style={{ color: p.text }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Copy (read-only) ── */}
            <div className="card-base rounded-xl p-3 space-y-2">
              <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Copy do slide {slide.order}</label>
              <div className="px-3 py-2 rounded-lg bg-bg-deep border border-border/50 text-text-primary text-xs font-bold leading-snug">
                {slide.headline}
              </div>
              <div className="px-3 py-2 rounded-lg bg-bg-deep border border-border/50 text-text-secondary text-[11px] leading-relaxed">
                {slide.body}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
