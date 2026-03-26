"use client";

import { useState, useCallback } from "react";
import { promptsFacePost } from "@/lib/prompts-facepost";

const formatos = [
  { id: "post-feed", label: "Post Feed", desc: "Instagram / Facebook", ratio: "1:1", w: 40, h: 40 },
  { id: "post-retrato", label: "Post Retrato", desc: "Melhor engajamento", ratio: "4:5", w: 36, h: 48 },
  { id: "story", label: "Story / Reels", desc: "Instagram / TikTok", ratio: "9:16", w: 28, h: 50 },
  { id: "banner", label: "Banner", desc: "Site / Facebook Cover", ratio: "16:9", w: 50, h: 28 },
];

const subcategorias = [
  "Todos", "Consultor", "Tecnologia", "Estilo", "Confiança", "Social", "Autoridade", "Bastidores", "Lifestyle",
];



export default function FacePostPage() {
  const [facePhotos, setFacePhotos] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedSub, setSelectedSub] = useState("Todos");
  const [formato, setFormato] = useState(formatos[0]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<{ url: string; saved: boolean; saving: boolean; debug?: any }[]>([]);

  const handleFaceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || facePhotos.length >= 2) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFacePhotos((prev) => [...prev, ev.target?.result as string]);
    reader.readAsDataURL(file);
  }, [facePhotos.length]);

  const filtered = selectedSub === "Todos" ? promptsFacePost : promptsFacePost.filter((p) => p.sub === selectedSub);

  const handleGenerate = async () => {
    if (!prompt.trim() || facePhotos.length === 0) return;
    setLoading(true);
    try {
      const finalPrompt = `${prompt}\n\nINSTRUÇÃO CRÍTICA: Mantenha as características faciais exatamente iguais à imagem de referência fornecida. O rosto, cabelo, tom de pele e traços da pessoa devem ser preservados com fidelidade.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          tipo: formato.label,
          estilo: "Profissional",
          ratio: formato.ratio,
          tool: "CRIADOR",
          referenceImage: facePhotos[0],
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Erro: ${data.error}`);
      } else if (data.imageUrl) {
        setResults((prev) => [{ url: data.imageUrl, saved: false, saving: false, debug: data.debug }, ...prev]);
      }
    } catch (err) {
      alert(`Erro de conexão: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">FacePost</h1>
        <p className="text-text-secondary text-sm mt-1">Crie conteúdo profissional com seu próprio rosto para redes sociais.</p>
      </div>

      <div className="rounded-2xl card-base p-6 space-y-6">
        {/* Upload de fotos do rosto */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
            Suas Fotos de Referência
            <span className="font-normal normal-case tracking-normal ml-1 text-text-muted/60">(até 2 fotos do rosto)</span>
          </label>
          <div className="flex gap-3">
            {facePhotos.map((photo, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-accent-violet/30 bg-bg-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Rosto ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => setFacePhotos((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-bg-deep/80 flex items-center justify-center text-accent-rose hover:bg-accent-rose/20 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {facePhotos.length < 2 && (
              <label className="cursor-pointer group">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-accent-violet/30 hover:border-accent-violet/50 bg-bg-deep flex flex-col items-center justify-center gap-1.5 transition-all">
                  <svg className="w-6 h-6 text-accent-violet/50 group-hover:text-accent-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-[10px] text-text-muted group-hover:text-accent-violet transition-colors">Adicionar foto</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
              </label>
            )}
          </div>
          {facePhotos.length === 0 && (
            <p className="text-[10px] text-accent-rose/70 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              Envie pelo menos 1 foto do rosto para começar
            </p>
          )}
        </div>

        {/* Subcategoria filter */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Categoria</label>
          <div className="flex flex-wrap gap-1.5">
            {subcategorias.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSub(sub)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  selectedSub === sub
                    ? "bg-accent-violet/20 text-accent-violet border border-accent-violet/25"
                    : "bg-bg-deep/50 border border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt list */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
            Escolha um prompt <span className="font-normal normal-case tracking-normal text-text-muted/60">ou escreva o seu</span>
          </label>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 mb-4">
            {filtered.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p.text)}
                className={`w-full text-left p-3 rounded-lg border transition-all group ${
                  prompt === p.text
                    ? "bg-accent-violet/[0.06] border-accent-violet/20"
                    : "bg-bg-deep/50 border-border hover:border-accent-violet/15 hover:bg-accent-violet/[0.02]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent-violet/10 text-accent-violet/70">
                    {p.sub}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-text-primary mb-0.5">{p.title}</p>
                    <p className="text-[11px] text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors line-clamp-2">
                      {p.text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Selecione um prompt acima ou escreva o seu próprio..."
            rows={3}
            className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-sm resize-none"
          />
        </div>

        {/* Formato */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Formato</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {formatos.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormato(f)}
                className={`btn-press flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  formato.id === f.id
                    ? "bg-accent-violet/15 border border-accent-violet/30"
                    : "bg-bg-deep border border-border hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-center w-full h-10">
                  <div
                    className={`rounded-[3px] border ${formato.id === f.id ? "border-accent-violet bg-accent-violet/10" : "border-text-muted/25 bg-bg-card-hover"}`}
                    style={{ width: `${f.w * 0.6}px`, height: `${f.h * 0.6}px`, maxWidth: "36px", maxHeight: "36px" }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${formato.id === f.id ? "text-accent-violet" : "text-text-secondary"}`}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || facePhotos.length === 0}
          className="btn-press w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-violet to-accent-rose text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] transition-all disabled:opacity-40 flex items-center gap-2"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              Gerar FacePost
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-[700] font-[var(--font-heading)] mb-4 tracking-tight">Resultados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, i) => (
              <div key={i} className="rounded-2xl card-base overflow-hidden">
                <div className="bg-bg-card-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={`FacePost ${i + 1}`} loading="lazy" className="w-full h-auto object-contain" />
                </div>
                <div className="p-3 space-y-2">
                  {/* Save to gallery */}
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
                                tool: "FACEPOST",
                                prompt,
                                metadata: { tipo: formato.label },
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
                    <a href={item.url} download target="_blank" className="btn-press flex-1 py-2.5 rounded-lg text-xs font-bold bg-accent-violet/10 text-accent-violet hover:bg-accent-violet/20 transition-colors text-center">
                      Download HD
                    </a>
                    <button className="btn-press flex-1 py-2.5 rounded-lg text-xs font-medium border border-border text-text-secondary hover:border-accent-violet/30 hover:text-accent-violet transition-colors">
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
