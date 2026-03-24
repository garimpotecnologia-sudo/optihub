"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const formatos = [
  { id: "post-feed", label: "Post Feed", desc: "Instagram / Facebook", ratio: "1:1", w: 40, h: 40 },
  { id: "post-retrato", label: "Post Retrato", desc: "Melhor engajamento", ratio: "4:5", w: 36, h: 45 },
  { id: "story", label: "Story / Reels", desc: "Instagram / TikTok", ratio: "9:16", w: 28, h: 50 },
  { id: "banner", label: "Banner", desc: "Site / Facebook Cover", ratio: "16:9", w: 50, h: 28 },
  { id: "catalogo", label: "Catálogo", desc: "Múltiplos produtos", ratio: "1:1", w: 40, h: 40 },
  { id: "cartao", label: "Cartão de Visita", desc: "Impressão", ratio: "16:9", w: 50, h: 28 },
];

const estilos = ["Moderno", "Minimalista", "Luxo", "Colorido", "Profissional"];

export default function CriarPage() {
  const [prompt, setPrompt] = useState("");
  const [formato, setFormato] = useState(formatos[0]);
  const [estilo, setEstilo] = useState("Moderno");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [savedLogo, setSavedLogo] = useState<string | null>(null);
  const [useLogo, setUseLogo] = useState(false);
  const supabase = createClient();

  // Load saved logo from profile
  useEffect(() => {
    async function loadLogo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("optica_logo")
        .eq("id", user.id)
        .single();
      if (data?.optica_logo) {
        setSavedLogo(data.optica_logo);
        setLogo(data.optica_logo);
      }
    }
    loadLogo();
  }, [supabase]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!logo) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upload to Supabase Storage
    const base64 = logo.split(",")[1];
    if (!base64) return;

    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const fileName = `logos/${user.id}/logo.png`;

    const { data: uploadData } = await supabase.storage
      .from("generations")
      .upload(fileName, buffer, { contentType: "image/png", upsert: true });

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from("generations")
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;

      await supabase.from("profiles").update({
        optica_logo: publicUrl,
      }).eq("id", user.id);

      setSavedLogo(publicUrl);
      setLogo(publicUrl);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      let finalPrompt = prompt;
      if (useLogo && logo) {
        finalPrompt += ". Include the company logo in the design.";
      }

      const referenceImages = useLogo && logo ? [logo] : undefined;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          tipo: formato.label,
          estilo,
          ratio: formato.ratio,
          tool: "CRIADOR",
          referenceImages,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setResults((prev) => [data.imageUrl, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao gerar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">
          Criador de Artes
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Descreva a arte que você precisa e a IA cria para você.
        </p>
      </div>

      {/* Input area */}
      <div className="rounded-2xl card-base p-6 space-y-6">
        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Descreva sua arte
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Post para Instagram promovendo óculos de sol Ray-Ban Aviator com desconto de 30%, fundo degradê em tons de azul e dourado, tipografia moderna..."
            rows={4}
            className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-sm resize-none"
          />
        </div>

        {/* Logo upload section */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Logo da Empresa
          </label>
          <div className="flex items-start gap-4">
            {/* Logo preview / upload */}
            <label className="cursor-pointer group">
              <div className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                logo
                  ? "border-accent-green/30 bg-bg-deep"
                  : "border-border hover:border-accent-green/30 bg-bg-deep"
              }`}>
                {logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto text-text-muted group-hover:text-accent-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-[10px] text-text-muted mt-1 block">Upload</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                {/* Use logo toggle */}
                <button
                  onClick={() => setUseLogo(!useLogo)}
                  disabled={!logo}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    useLogo && logo
                      ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                      : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary disabled:opacity-40"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${
                    useLogo && logo ? "bg-accent-green border-accent-green" : "border-text-muted"
                  }`}>
                    {useLogo && logo && (
                      <svg className="w-2.5 h-2.5 text-bg-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Incluir logo na arte
                </button>

                {/* Save logo button */}
                {logo && logo !== savedLogo && (
                  <button
                    onClick={handleSaveLogo}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20 hover:bg-accent-teal/20 transition-all"
                  >
                    Salvar logo no perfil
                  </button>
                )}
              </div>

              {savedLogo && (
                <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Logo salva no perfil — disponível em todas as gerações
                </p>
              )}

              {!logo && (
                <p className="text-[11px] text-text-muted">
                  Suba a logo da sua ótica para incluir nas artes. Ela ficará salva para uso futuro.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formato (tipo + proporção unificados) */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
            Formato
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {formatos.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormato(f)}
                className={`btn-press flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  formato.id === f.id
                    ? "bg-accent-green/15 border border-accent-green/30"
                    : "bg-bg-deep border border-border hover:border-border-hover"
                }`}
              >
                {/* Visual ratio preview */}
                <div className="flex items-center justify-center w-full h-14">
                  <div
                    className={`rounded-[3px] border transition-all ${
                      formato.id === f.id
                        ? "border-accent-green bg-accent-green/10"
                        : "border-text-muted/25 bg-bg-card-hover"
                    }`}
                    style={{
                      width: `${f.w}px`,
                      height: `${f.h}px`,
                      maxWidth: "48px",
                      maxHeight: "52px",
                    }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center gap-[3px] p-1.5">
                      <div className={`w-full h-[2px] rounded-full ${formato.id === f.id ? "bg-accent-green/30" : "bg-text-muted/15"}`} />
                      <div className={`w-3/4 h-[2px] rounded-full ${formato.id === f.id ? "bg-accent-green/20" : "bg-text-muted/10"}`} />
                      <div className={`w-1/2 h-[2px] rounded-full ${formato.id === f.id ? "bg-accent-green/15" : "bg-text-muted/8"}`} />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`block text-[11px] font-bold leading-tight ${formato.id === f.id ? "text-accent-green" : "text-text-secondary"}`}>
                    {f.label}
                  </span>
                  <span className={`block text-[9px] mt-0.5 ${formato.id === f.id ? "text-accent-green/60" : "text-text-muted/60"}`}>
                    {f.ratio} · {f.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Estilo */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
            Estilo Visual
          </label>
          <div className="flex flex-wrap gap-2">
            {estilos.map((e) => (
              <button
                key={e}
                onClick={() => setEstilo(e)}
                className={`btn-press px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  estilo === e
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-bg-deep border border-border text-text-muted hover:text-text-secondary hover:border-border-hover"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all disabled:opacity-40 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Gerando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gerar Arte
            </>
          )}
        </button>
      </div>

      {/* Results grid */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-[700] font-[var(--font-heading)] mb-4 tracking-tight">
            Resultados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((url, i) => (
              <div
                key={i}
                className="rounded-2xl card-base overflow-hidden group"
              >
                <div className="aspect-square bg-bg-card-hover flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Geração ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex gap-2">
                  <button className="btn-press flex-1 py-2.5 rounded-lg text-xs font-bold bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors">
                    Download HD
                  </button>
                  <button className="btn-press flex-1 py-2.5 rounded-lg text-xs font-medium border border-border text-text-secondary hover:border-accent-green/30 hover:text-accent-green transition-colors">
                    Compartilhar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !loading && (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-text-muted/15 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
          <p className="text-text-muted text-sm">
            Suas criações aparecerão aqui. Descreva o que precisa e clique em Gerar.
          </p>
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
