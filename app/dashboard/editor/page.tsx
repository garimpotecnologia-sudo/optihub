"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface SubOption { label: string; prompt: string; }
interface Action { id: string; label: string; icon: string; prompt: string; subOptions?: SubOption[]; }

const actions: Action[] = [
  {
    id: "remove-bg", label: "Remover Fundo", icon: "/editor-icons/remove-bg.png",
    prompt: "Remove the background completely from this eyewear product photo. Keep the product perfectly isolated with clean, crisp edges. Output on a pure white background with a subtle natural drop shadow beneath the frame for depth. Maintain every detail of the product: textures, reflections, lens clarity, and brand markings. Professional e-commerce quality, 8K resolution feel.",
  },
  {
    id: "lighting", label: "Ajustar Iluminação", icon: "/editor-icons/lighting.png",
    prompt: "Enhance the lighting of this eyewear product photo to professional studio quality. Apply a three-point lighting setup: strong key light from the upper left creating clean highlights on the frame, soft fill light from the right to eliminate harsh shadows, and a subtle rim light from behind to separate the product from the background. Make the lenses look crystal clear with natural reflections. Ensure the frame material texture is visible — glossy surfaces should shine, matte surfaces should look velvety. Color-accurate, high-end product photography standard.",
  },
  {
    id: "lifestyle", label: "Cenário Lifestyle", icon: "/editor-icons/lifestyle.png",
    prompt: "Place this eyewear in an aspirational lifestyle setting, cinematic color grading, shallow depth of field, natural golden hour lighting",
    subOptions: [
      { label: "Mesa de café", prompt: "Place this exact eyewear casually on a rich walnut coffee table beside a ceramic latte cup and an open hardcover book. Morning golden light streaming through a nearby window, creating warm highlights on the frame. Shallow depth of field with a cozy bokeh background of a modern apartment. The eyewear is the hero — sharp focus, every detail visible. Lifestyle editorial photography, warm tones, inviting mood." },
      { label: "Beira da piscina", prompt: "Place this exact eyewear on the edge of an infinity pool overlooking the ocean. Crystal-clear turquoise water, white marble pool edge, a folded luxury towel nearby. Bright golden hour sunlight reflecting off the lenses with beautiful lens flare. Summer resort luxury atmosphere, vibrant yet sophisticated color palette. Shot with a wide aperture for creamy bokeh in the background. High-end travel magazine aesthetic." },
      { label: "Escritório moderno", prompt: "Place this exact eyewear on a sleek Scandinavian-style desk next to a MacBook and a small potted monstera plant. Clean, bright workspace with floor-to-ceiling windows showing a city skyline. Soft diffused natural light creating gentle shadows. The frame sits on a leather desk pad. Modern professional lifestyle, clean composition, aspirational work-from-home setup. Architectural Digest meets product photography." },
      { label: "Bancada de mármore", prompt: "Place this exact eyewear on a Calacatta gold marble countertop beside an elegant perfume bottle and a small gold tray. Soft, luxurious ambient lighting from above with warm undertones. The marble veins create natural leading lines toward the product. Premium beauty-meets-fashion editorial style. Rich textures, sophisticated color palette of whites, golds, and warm neutrals. Vogue-level product styling." },
      { label: "Piquenique ao ar livre", prompt: "Place this exact eyewear on a cream linen picnic blanket in a sun-dappled park. Surrounded by fresh fruits, a straw hat, and wildflowers. Soft, dreamy golden hour backlight filtering through tree leaves creating beautiful bokeh circles. Natural, organic color palette with warm greens and golden tones. Relaxed, free-spirited lifestyle mood. Fashion brand campaign aesthetic, Canon 85mm f/1.4 shallow depth of field look." },
    ],
  },
  {
    id: "vitrine", label: "Cenário Vitrine", icon: "/editor-icons/vitrine.png",
    prompt: "Place this eyewear in a premium optical store display with dramatic lighting and luxurious materials",
    subOptions: [
      { label: "Vitrine premium", prompt: "Place this exact eyewear inside a premium glass display case with precision LED spotlighting from above. Deep black velvet background, the frame illuminated with focused accent lights that create a halo glow around the product. Subtle neon accent light in purple or teal reflecting off the glass. Ultra-luxury jewelry store aesthetic — think Cartier or Tom Ford boutique. Dramatic contrast, the eyewear gleams like a precious object. Moody, sophisticated, high-end retail photography." },
      { label: "Expositor de madeira", prompt: "Place this exact eyewear on an artisan walnut wood display stand with visible grain texture. Warm amber accent lighting from the sides, creating rich shadows and highlights on the frame. Background of a boutique optical store with blurred shelves of frames. Handcrafted, premium feel — like a curated independent eyewear gallery. Warm color temperature, cozy yet luxurious. The wood grain and frame details are both in sharp focus." },
      { label: "Prateleira minimalista", prompt: "Place this exact eyewear on a floating white lacquer shelf against a clean matte white wall. Single dramatic spotlight from above casting a precise shadow below. Minimal, Zen-like composition with generous negative space. Ultra-modern optical boutique aesthetic — Apple Store meets luxury eyewear. Clean lines, perfect symmetry, the product is the absolute focal point. High-key lighting, crisp and architectural." },
      { label: "Display com espelho", prompt: "Place this exact eyewear on a polished mirrored surface that creates a perfect reflection beneath it. Dark, moody background with focused top-down lighting. The mirror reflection adds depth and doubles the visual impact of the product. Subtle colored accent lighting (deep purple or emerald) visible in the mirror reflection. High-end product photography style used by luxury brands like Dior or Prada. Dramatic, sleek, and modern." },
      { label: "Balcão de atendimento", prompt: "Place this exact eyewear on a sleek matte black store counter with soft LED backlighting creating a glowing edge. A small velvet presentation tray holds the frame. Blurred background shows a modern optical store interior with warm ambient lighting. The counter has a subtle branded feel — sophisticated, welcoming, professional. The eyewear is positioned at a slight angle, as if presented to a customer. Retail photography, inviting and premium." },
    ],
  },
  {
    id: "studio", label: "Cenário Estúdio", icon: "/editor-icons/studio.png",
    prompt: "Professional studio product photography of this eyewear with controlled lighting and clean backgrounds",
    subOptions: [
      { label: "Fundo branco infinito", prompt: "Place this exact eyewear on a pure white seamless cyclorama background. Professional three-point studio lighting: key light creating a clean specular highlight on the frame, fill light softening shadows, and backlight for edge separation. Subtle natural drop shadow on the white surface for grounding. The product floats in clean white space. E-commerce hero image quality — every detail razor-sharp, true-to-life colors. Shot on a medium format camera at f/11 for maximum sharpness." },
      { label: "Gradiente cinza", prompt: "Place this exact eyewear floating against a smooth charcoal-to-light-gray gradient background. Dramatic overhead studio lighting with a large softbox creating even, professional illumination. The gradient adds depth without distraction. Subtle catchlight reflections in the lenses. Premium catalog photography style — clean, authoritative, and elegant. Center-frame composition with perfect symmetry." },
      { label: "Fundo colorido", prompt: "Place this exact eyewear against a bold, vibrant solid color background (electric blue, hot pink, or vivid orange — choose the color that creates the strongest contrast with the frame). Hard studio lighting creating graphic, high-contrast shadows. Pop art meets high fashion editorial style. The frame pops dramatically against the saturated background. Bold, eye-catching, Instagram-ready. Think Warby Parker campaign meets Andy Warhol — fun, modern, and impossible to scroll past." },
      { label: "Superfície refletiva", prompt: "Place this exact eyewear on a glossy black acrylic surface that creates a mirror-like reflection below. Studio lighting with dramatic side lights creating bright edge highlights on the frame contours. Deep black background fading to pure darkness. The reflection on the surface is slightly diffused, adding sophistication. Luxury automotive-style product photography — think how Rolex or Ray-Ban shoots their hero products. Moody, powerful, premium. Neon accent light (purple or orange) subtly rimming the edges." },
      { label: "Sombra artística", prompt: "Place this exact eyewear on a warm sand-colored or cream surface with dramatic hard side lighting from the left creating long, artistic geometric shadows of the frame. Late afternoon sun simulation — warm, golden light with high contrast. The shadow pattern becomes part of the composition, creating visual interest. Editorial fashion photography style — Vogue Eyewear campaign aesthetic. Artistic, evocative, storytelling through light and shadow. The interplay between the product and its shadow is the hero of this shot." },
    ],
  },
  {
    id: "variations", label: "Variações", icon: "/editor-icons/variations.png",
    prompt: "Generate creative product variations of this eyewear maintaining the exact frame design",
    subOptions: [
      { label: "Variação de cores", prompt: "Generate 4 color variations of this exact eyewear frame displayed side by side on a clean white background. Show the same frame design in: classic glossy black, warm tortoiseshell/havana, crystal clear transparent, and deep navy blue. Each frame should be at the same angle and size for easy comparison. Professional catalog layout with consistent lighting across all variations. Clean, organized, e-commerce ready — perfect for a product page color selector." },
      { label: "Ângulos diferentes", prompt: "Show this exact eyewear from 4 different professional angles arranged in a clean grid layout: front-facing view (straight on), three-quarter angle from the left showing depth, side profile view showing the temple arm design, and a top-down view of the folded frame. Consistent white background and studio lighting across all angles. Each angle reveals different design details of the frame. Product photography standard used by premium eyewear e-commerce sites." },
      { label: "Diferentes lentes", prompt: "Show this exact eyewear frame with 4 different lens options displayed in a clean comparison layout: crystal clear prescription-ready lenses, gradient smoke-to-clear lenses, blue mirror reflective lenses, and classic green G-15 lenses. Same frame, same angle, same lighting — only the lenses change. Each variant labeled-ready with distinct lens characteristics clearly visible. Professional optical product catalog style." },
      { label: "Flat lay", prompt: "Create a premium flat lay composition shot from directly above. This exact eyewear centered as the hero, surrounded by matching accessories: a structured hard case, a microfiber cleaning cloth with subtle branding, a branded box or sleeve, and a small lens cleaning spray. All items arranged with geometric precision on a clean marble or linen surface. Styled with negative space between items. Premium unboxing experience aesthetic — Apple-level product presentation. Soft, even overhead lighting with no harsh shadows." },
      { label: "Composição artística", prompt: "Create a dramatic artistic editorial composition of this exact eyewear. Position the frame at a dynamic angle on a dark surface with neon-colored accent lighting — vibrant purple and electric orange glowing edges reminiscent of LED wire glasses. Dramatic rim lighting highlighting the frame silhouette. Moody, cinematic atmosphere with deep shadows and selective illumination. High-fashion editorial meets cyberpunk aesthetic. The kind of hero shot that stops you mid-scroll — bold, artistic, and unforgettable. Deep blacks, vivid neon accents, razor-sharp product detail." },
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
                className={`btn-press flex flex-col rounded-xl overflow-hidden transition-all ${
                  selectedAction === a.id
                    ? "ring-2 ring-accent-green ring-offset-2 ring-offset-bg-card shadow-[0_0_20px_rgba(3,255,148,0.12)]"
                    : "ring-1 ring-border hover:ring-border-hover"
                }`}
              >
                <div className="aspect-square w-full">
                  <Image src={a.icon} alt={a.label} width={200} height={200} className="w-full h-full object-cover" />
                </div>
                <div className={`py-1.5 px-1 text-center transition-all w-full ${
                  selectedAction === a.id
                    ? "bg-accent-green/90"
                    : "bg-bg-deep/80"
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
