"use client";

import { useState, useEffect, useCallback } from "react";
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

const promptsProntos = [
  { cat: "Promoção", text: "Post para Instagram com promoção de 30% OFF em óculos de sol, fundo vibrante com cores quentes, tipografia moderna e chamativa" },
  { cat: "Promoção", text: "Story urgente de oferta relâmpago: armações com até 50% de desconto, timer visual, cores vermelho e amarelo" },
  { cat: "Promoção", text: "Banner para site com liquidação de inverno, óculos de grau com preços especiais, design elegante e clean" },
  { cat: "Promoção", text: "Post carrossel mostrando 4 armações em promoção com preço antigo riscado e novo preço destacado" },
  { cat: "Lançamento", text: "Post de lançamento da nova coleção de armações verão 2025, design sofisticado com fundo claro e detalhes dourados" },
  { cat: "Lançamento", text: "Story anunciando chegada de nova marca na loja, suspense com fundo escuro e texto 'Em breve' com brilho" },
  { cat: "Lançamento", text: "Banner de lançamento exclusivo de óculos de sol esportivos, visual dinâmico e moderno com fundo em movimento" },
  { cat: "Datas", text: "Post para Dia das Mães promovendo óculos femininos, tons de rosa e dourado, mensagem carinhosa e elegante" },
  { cat: "Datas", text: "Arte de Natal com promoção de final de ano, óculos como presente perfeito, decoração natalina sutil e premium" },
  { cat: "Datas", text: "Post de Dia dos Pais com armações masculinas clássicas, fundo azul marinho e tipografia forte" },
  { cat: "Datas", text: "Story de Black Friday com countdown, descontos agressivos em armações e lentes, design impactante" },
  { cat: "Produto", text: "Foto de produto de óculos Ray-Ban Aviator em fundo branco minimalista com sombra suave e reflexo" },
  { cat: "Produto", text: "Apresentação de armação feminina em cenário lifestyle: mesa de café, livro e óculos, luz natural" },
  { cat: "Produto", text: "Catálogo visual com 6 modelos de armações de grau, grid organizado com nome e preço de cada" },
  { cat: "Produto", text: "Óculos de sol em cenário de praia, fotografia aspiracional com cores tropicais vibrantes" },
  { cat: "Institucional", text: "Post institucional mostrando a fachada da ótica, equipe sorridente, design profissional com as cores da marca" },
  { cat: "Institucional", text: "Arte de 'Conheça nossa equipe' com espaço para fotos dos funcionários, layout moderno e acolhedor" },
  { cat: "Institucional", text: "Post de depoimento de cliente satisfeito, design com aspas grandes, foto do cliente e estrelas de avaliação" },
  { cat: "Institucional", text: "Story de bastidores da ótica: ajuste de armação, atendimento personalizado, ambiente da loja" },
  { cat: "Educativo", text: "Post educativo explicando a diferença entre lentes monofocal, bifocal e multifocal, infográfico visual e didático" },
];

const categorias = ["Todos", "Promoção", "Lançamento", "Datas", "Produto", "Institucional", "Educativo"];

export default function CriarPage() {
  const [prompt, setPrompt] = useState("");
  const [formato, setFormato] = useState(formatos[0]);
  const [estilo, setEstilo] = useState("Moderno");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ url: string; saved: boolean; saving: boolean }[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savedLogo, setSavedLogo] = useState<string | null>(null);
  const [useLogo, setUseLogo] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [promptCat, setPromptCat] = useState("Todos");
  const supabase = createClient();

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoError("");
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRefUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRefImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSaveLogo = async () => {
    if (!logoFile && !logo) return;
    setLogoSaving(true);
    setLogoError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLogoError("Faça login primeiro"); setLogoSaving(false); return; }

      const fileName = `logos/${user.id}/logo-${Date.now()}.png`;

      let uploadResult;

      if (logoFile) {
        // Upload File object directly — most reliable
        uploadResult = await supabase.storage
          .from("generations")
          .upload(fileName, logoFile, { contentType: logoFile.type, upsert: true });
      } else if (logo && logo.startsWith("data:")) {
        // Fallback: convert base64 data URL to blob
        const res = await fetch(logo);
        const blob = await res.blob();
        uploadResult = await supabase.storage
          .from("generations")
          .upload(fileName, blob, { contentType: "image/png", upsert: true });
      }

      if (uploadResult?.error) {
        setLogoError(`Erro: ${uploadResult.error.message}`);
        setLogoSaving(false);
        return;
      }

      if (uploadResult?.data) {
        const { data: urlData } = supabase.storage
          .from("generations")
          .getPublicUrl(uploadResult.data.path);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ optica_logo: urlData.publicUrl })
          .eq("id", user.id);

        if (updateError) {
          setLogoError(`Erro ao salvar perfil: ${updateError.message}`);
        } else {
          setSavedLogo(urlData.publicUrl);
          setLogo(urlData.publicUrl);
          setLogoFile(null);
        }
      }
    } catch (err) {
      setLogoError(`Erro inesperado: ${err}`);
    } finally {
      setLogoSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      let finalPrompt = prompt;
      if (useLogo && logo) finalPrompt += ". Include the company logo in the design.";

      const refs: string[] = [];
      if (useLogo && logo) refs.push(logo);
      if (refImage) refs.push(refImage);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          tipo: formato.label,
          estilo,
          ratio: formato.ratio,
          tool: "CRIADOR",
          referenceImages: refs.length > 0 ? refs : undefined,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) setResults((prev) => [{ url: data.imageUrl, saved: false, saving: false }, ...prev]);
    } catch (err) {
      console.error("Erro ao gerar:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = promptCat === "Todos"
    ? promptsProntos
    : promptsProntos.filter((p) => p.cat === promptCat);

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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-secondary">
              Descreva sua arte
            </label>
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                showPrompts
                  ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/30"
                  : "bg-bg-deep border border-border text-text-muted hover:text-accent-amber hover:border-accent-amber/20"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              {showPrompts ? "Fechar" : "Prompts prontos"}
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Post para Instagram promovendo óculos de sol Ray-Ban Aviator com desconto de 30%, fundo degradê em tons de azul e dourado..."
            rows={4}
            className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-sm resize-none"
          />
        </div>

        {/* Prompts prontos */}
        {showPrompts && (
          <div className="rounded-xl border border-accent-amber/15 bg-accent-amber/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-amber uppercase tracking-wider">
                Prompts Prontos
              </span>
              <span className="text-[10px] text-text-muted">
                Clique para usar
              </span>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPromptCat(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    promptCat === cat
                      ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/25"
                      : "bg-bg-deep/50 border border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prompt list */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(p.text);
                    setShowPrompts(false);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-bg-deep/50 border border-border hover:border-accent-amber/20 hover:bg-accent-amber/[0.03] transition-all group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent-amber/10 text-accent-amber/70">
                      {p.cat}
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                      {p.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logo + Referência lado a lado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Logo upload */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
              Logo da Empresa
            </label>
            <div className="flex items-start gap-3">
              <label className="cursor-pointer group shrink-0">
                <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                  logo ? "border-accent-green/30 bg-bg-deep" : "border-border hover:border-accent-green/30 bg-bg-deep"
                }`}>
                  {logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <svg className="w-5 h-5 text-text-muted group-hover:text-accent-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setUseLogo(!useLogo)}
                    disabled={!logo}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      useLogo && logo
                        ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                        : "bg-bg-deep border border-border text-text-muted disabled:opacity-40"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm border transition-all flex items-center justify-center ${
                      useLogo && logo ? "bg-accent-green border-accent-green" : "border-text-muted"
                    }`}>
                      {useLogo && logo && (
                        <svg className="w-2 h-2 text-bg-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    Incluir na arte
                  </button>
                  {logo && logo !== savedLogo && (
                    <button
                      onClick={handleSaveLogo}
                      disabled={logoSaving}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20 hover:bg-accent-teal/20 transition-all disabled:opacity-50"
                    >
                      {logoSaving ? "Salvando..." : "Salvar"}
                    </button>
                  )}
                </div>
                {logoError && (
                  <p className="text-[10px] text-accent-rose flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    {logoError}
                  </p>
                )}
                {savedLogo && !logoError && (
                  <p className="text-[10px] text-accent-green/70 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Salva no perfil
                  </p>
                )}
                {!logo && !logoError && <p className="text-[10px] text-text-muted">Suba a logo para incluir nas artes</p>}
              </div>
            </div>
          </div>

          {/* Imagem de referência */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
              Imagem de Referência
              <span className="font-normal normal-case tracking-normal ml-1 text-text-muted/60">(opcional)</span>
            </label>
            <div className="flex items-start gap-3">
              <label className="cursor-pointer group shrink-0">
                <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                  refImage ? "border-accent-violet/30 bg-bg-deep" : "border-border hover:border-accent-violet/30 bg-bg-deep"
                }`}>
                  {refImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={refImage} alt="Referência" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-text-muted group-hover:text-accent-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                    </svg>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
              </label>
              <div className="flex-1 space-y-1.5">
                {refImage ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-accent-violet font-medium">Referência adicionada</span>
                    <button
                      onClick={() => setRefImage(null)}
                      className="text-[11px] text-text-muted hover:text-accent-rose transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Suba uma imagem de referência para a IA se inspirar no estilo, cores ou composição
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formato */}
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
                <div className="flex items-center justify-center w-full h-14">
                  <div
                    className={`rounded-[3px] border transition-all ${
                      formato.id === f.id
                        ? "border-accent-green bg-accent-green/10"
                        : "border-text-muted/25 bg-bg-card-hover"
                    }`}
                    style={{ width: `${f.w}px`, height: `${f.h}px`, maxWidth: "48px", maxHeight: "52px" }}
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
          <h2 className="text-lg font-[700] font-[var(--font-heading)] mb-4 tracking-tight">Resultados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, i) => (
              <div key={i} className="rounded-2xl card-base overflow-hidden">
                <div className="aspect-square bg-bg-card-hover flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={`Geração ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-2">
                  {/* Save to gallery prompt */}
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
                                tool: "CRIADOR",
                                prompt,
                                metadata: { tipo: formato.label, estilo, ratio: formato.ratio },
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
          <p className="text-text-muted text-sm">Suas criações aparecerão aqui. Descreva o que precisa e clique em Gerar.</p>
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
