"use client";

import { useState, useCallback } from "react";

const formatos = [
  { id: "post-feed", label: "Post Feed", desc: "Instagram / Facebook", ratio: "1:1", w: 40, h: 40 },
  { id: "post-retrato", label: "Post Retrato", desc: "Melhor engajamento", ratio: "4:5", w: 36, h: 48 },
  { id: "story", label: "Story / Reels", desc: "Instagram / TikTok", ratio: "9:16", w: 28, h: 50 },
  { id: "banner", label: "Banner", desc: "Site / Facebook Cover", ratio: "16:9", w: 50, h: 28 },
];

const subcategorias = [
  "Todos", "Consultor", "Tecnologia", "Estilo", "Confiança", "Social", "Autoridade", "Bastidores", "Lifestyle",
];

const promptsFacePost = [
  // Consultor Profissional
  { sub: "Consultor", title: "O Consultor Atencioso", text: "A pessoa da foto de referência de pé em uma ótica bem iluminada e moderna, conversando com um cliente sorridente. Segura um par de óculos com uma mão e com a outra aponta para detalhes na bancada para demonstrar precisão visual. Expressão de profissionalismo e empatia. Iluminação natural de loja, fundo com vitrines de armações desfocadas." },
  { sub: "Consultor", title: "A Calibração Perfeita", text: "Close-up nas mãos da pessoa da foto de referência, especialista em ótica, usando ferramentas delicadas para ajustar uma armação de óculos. Na bancada de trabalho, instrumentos de precisão óptica organizados. Fundo de laboratório óptico limpo e profissional. Iluminação focada nas mãos e no trabalho." },
  { sub: "Consultor", title: "O Olhar Científico", text: "A pessoa da foto de referência com expressão concentrada, vestindo jaleco branco. Olha através de um equipamento óptico de alta precisão com iluminação controlada e científica. Ambiente de laboratório moderno e tecnológico ao fundo." },
  { sub: "Consultor", title: "A Explicação Tecnológica", text: "A pessoa da foto de referência explicando a tecnologia de lentes para um cliente atento. Aponta para um diagrama técnico de uma lente enquanto segura uma armação, ilustrando a escala dos tratamentos anti-reflexo. Estilo de foto corporativa moderna com iluminação profissional." },
  { sub: "Consultor", title: "A Revisão de Qualidade", text: "A pessoa da foto de referência inspecionando uma lente de óculos sob luz especial de controle de qualidade. Expressão de rigor profissional e atenção aos detalhes. Foco nítido na lente e nas mãos. Ambiente de laboratório óptico com equipamentos modernos ao fundo." },
  // Tecnologia e Modernidade
  { sub: "Tecnologia", title: "A Gravação na Lente", text: "Close-up extremo da mão da pessoa da foto de referência segurando uma lente de óculos transparente. Sob luz especial, padrões microscópicos de tecnologia são visíveis como marca de qualidade. Fundo de equipamentos ópticos modernos e sofisticados." },
  { sub: "Tecnologia", title: "O Scanner de Alta Tecnologia", text: "A pessoa da foto de referência operando um scanner óptico 3D avançado em ambiente de laboratório high-tech. Telas com dados holográficos ao fundo. Estilo de foto de engenharia de precisão." },
  { sub: "Tecnologia", title: "O Revestimento Avançado", text: "A pessoa da foto de referência demonstrando o efeito repelente de água de uma lente com nanotecnologia. Uma gota de água escorrega perfeitamente sobre a superfície da lente. Iluminação difusa e limpa, ambiente de apresentação tecnológica." },
  { sub: "Tecnologia", title: "A Medição de Precisão", text: "A pessoa da foto de referência usando um dispositivo de medição pupilar digital de última geração em um cliente. Tela do dispositivo visível com dados precisos. Foco na tecnologia e no atendimento cuidadoso." },
  { sub: "Tecnologia", title: "A Inspeção do Material", text: "Close-up na mão da pessoa da foto de referência segurando uma haste de óculos feita de material de alta tecnologia. Comparando a textura e a leveza do material com instrumentos de precisão. Expressão de curiosidade tecnológica e expertise." },
  // Estilo e Design
  { sub: "Estilo", title: "O Curador de Estilo", text: "A pessoa da foto de referência na seção de moda da ótica, segurando uma armação de design exclusivo com elegância. Vitrines com armações premium ao fundo em bokeh suave. Estilo de foto de moda de rua de alta qualidade, iluminação natural." },
  { sub: "Estilo", title: "A Joia Escondida", text: "Close-up da pessoa da foto de referência focando na mão que segura uma armação de óculos de sol sofisticada. Detalhes da dobradiça e design premium visíveis. Iluminação lateral dramática destacando os acabamentos." },
  { sub: "Estilo", title: "O Foco no Detalhe", text: "A pessoa da foto de referência olhando diretamente para a câmera, usando óculos de grau modernos e elegantes. Na mão, segura uma armação exclusiva, enfatizando que os menores detalhes fazem a maior diferença. Iluminação de estúdio suave e profissional." },
  { sub: "Estilo", title: "A Vitrine de Design", text: "A pessoa da foto de referência arrumando uma vitrine de óculos com cuidado artístico. Posiciona armações de design com precisão, criando uma composição visual premium. Reflexos suaves no vidro da vitrine." },
  { sub: "Estilo", title: "A Armação Exclusiva", text: "A pessoa da foto de referência segurando uma armação de acetato vibrante e moderna, apresentando-a como peça de arte. Expressão de orgulho e inovação. Estilo de foto de moda de vanguarda com iluminação criativa." },
  // Confiança e Acolhimento
  { sub: "Confiança", title: "O Sorriso de Confiança", text: "A pessoa da foto de referência olhando para a câmera com sorriso caloroso e confiante, braços cruzados em postura profissional. Atrás, a ótica bem organizada e acolhedora. Iluminação natural quente, transmitindo confiança e cuidado." },
  { sub: "Confiança", title: "O Ambiente Acolhedor", text: "A pessoa da foto de referência de pé no centro de sua ótica acolhedora e bem decorada. Ambiente que valoriza conforto e profissionalismo. Prateleiras organizadas com armações ao fundo em desfoque suave." },
  { sub: "Confiança", title: "A Pequena Grande Ajuda", text: "A pessoa da foto de referência ajudando um cliente idoso a escolher óculos com paciência e dedicação. Demonstrando com cuidado como um ajuste preciso melhora a visão. Expressão de empatia genuína." },
  { sub: "Confiança", title: "A Visão Clara", text: "A pessoa da foto de referência olhando para a câmera através de uma lente de demonstração, com expressão amigável e profissional. Comunica a alegria de proporcionar visão nítida aos clientes." },
  { sub: "Confiança", title: "O Legado de Cuidado", text: "A pessoa da foto de referência em sua ótica, expressão serena e orgulhosa. Iluminação suave e nostálgica, transmitindo tradição aliada à inovação e cuidado constante com cada cliente." },
  // Redes Sociais e Marketing
  { sub: "Social", title: "O Reels de Boas-Vindas", text: "A pessoa da foto de referência na entrada da ótica, fazendo gesto de 'venha conhecer' com sorriso acolhedor. Fundo da loja iluminada e convidativa. Formato vertical 9:16 ideal para Reels/TikTok. Energia positiva e acessível." },
  { sub: "Social", title: "O Antes e Depois", text: "A pessoa da foto de referência segurando dois óculos — um antigo e gasto na mão esquerda, um novo e elegante na mão direita. Expressão de satisfação mostrando a transformação. Layout ideal para post comparativo no Instagram." },
  { sub: "Social", title: "A Dica do Dia", text: "A pessoa da foto de referência em close, apontando para a câmera com expressão de 'presta atenção'. Segura um óculos com a outra mão. Texto sobreposto 'Dica do Especialista' no estilo de card do Instagram. Fundo limpo da ótica." },
  { sub: "Social", title: "O Unboxing Premium", text: "A pessoa da foto de referência abrindo uma caixa elegante de óculos, revelando uma armação nova. Expressão de entusiasmo genuíno. Iluminação cinematográfica com destaque no produto sendo revelado. Ideal para Story ou Reels." },
  { sub: "Social", title: "O Especialista Responde", text: "A pessoa da foto de referência sentada em frente à câmera em estilo de entrevista/podcast, com a ótica ao fundo desfocada. Microfone de lapela discreto. Expressão atenta e profissional, como se estivesse respondendo perguntas dos seguidores. Iluminação de estúdio caseiro bem feita." },
  // Autoridade e Educação
  { sub: "Autoridade", title: "O Professor de Lentes", text: "A pessoa da foto de referência em frente a um quadro branco ou tela, explicando tipos de lentes com diagramas desenhados. Expressão didática e apaixonada. Jaleco branco, postura de palestrante. Iluminação de sala de aula moderna." },
  { sub: "Autoridade", title: "O Parecer Técnico", text: "A pessoa da foto de referência analisando um laudo óptico com expressão concentrada, usando óculos de grau. Mesa com documentos técnicos e uma armação sob análise. Ambiente de escritório profissional e organizado." },
  { sub: "Autoridade", title: "A Live Educativa", text: "A pessoa da foto de referência falando para a câmera em formato de live, segurando diferentes tipos de lentes para demonstração. Ring light refletindo nos óculos. Setup profissional de streaming com a ótica ao fundo." },
  { sub: "Autoridade", title: "O Comparativo de Materiais", text: "A pessoa da foto de referência segurando duas armações de materiais diferentes (metal e acetato), explicando as vantagens de cada uma. Expressão de quem domina o assunto. Close nas mãos e nos materiais com fundo desfocado." },
  { sub: "Autoridade", title: "O Mito vs Verdade", text: "A pessoa da foto de referência com expressão de 'agora vou te contar', apontando para dois painéis — um com ícone de X vermelho (mito) e outro com check verde (verdade). Óculos na mão como referência visual. Layout didático e moderno." },
  // Bastidores e Dia a Dia
  { sub: "Bastidores", title: "A Abertura da Loja", text: "A pessoa da foto de referência abrindo as portas da ótica pela manhã, luz dourada do nascer do sol entrando. Expressão de orgulho e determinação. Chaves na mão, loja impecável pronta para receber clientes." },
  { sub: "Bastidores", title: "A Organização do Estoque", text: "A pessoa da foto de referência organizando armações novas que acabaram de chegar. Caixas abertas na bancada, armações sendo dispostas com cuidado. Expressão de empolgação com as novidades. Ambiente de backoffice da ótica." },
  { sub: "Bastidores", title: "O Café da Manhã do Óptico", text: "A pessoa da foto de referência tomando café na ótica antes de abrir, lendo sobre tendências de eyewear em um tablet. Momento de preparação matinal. Luz suave da manhã, ambiente tranquilo e focado." },
  { sub: "Bastidores", title: "A Montagem dos Óculos", text: "A pessoa da foto de referência montando lentes em uma armação com equipamento de precisão. Close nas mãos trabalhando com cuidado. Concentração total. Ambiente de laboratório óptico com ferramentas especializadas." },
  { sub: "Bastidores", title: "O Fim de Expediente", text: "A pessoa da foto de referência fechando a ótica ao final do dia, olhando para trás com satisfação. Luzes da vitrine ainda acesas, rua ao fundo com iluminação noturna. Momento de reflexão e orgulho pelo dia de trabalho." },
  // Lifestyle Profissional
  { sub: "Lifestyle", title: "O Óptico Moderno", text: "A pessoa da foto de referência caminhando por uma rua urbana estilosa usando óculos de sol premium. Outfit profissional mas moderno. Fotografia de rua editorial com bokeh urbano. Confiança e estilo pessoal em destaque." },
  { sub: "Lifestyle", title: "O Networking do Setor", text: "A pessoa da foto de referência em um evento do setor óptico, conversando com outros profissionais. Crachá de evento visível. Ambiente de convenção ou feira com stands ao fundo desfocados. Expressão engajada e conectada." },
  { sub: "Lifestyle", title: "A Inspiração Criativa", text: "A pessoa da foto de referência em um café moderno, desenhando sketches de armações em um caderno. Óculos apoiados na mesa, café ao lado. Momento criativo e inspiracional. Iluminação natural de janela, tons quentes." },
  { sub: "Lifestyle", title: "O Treinamento Contínuo", text: "A pessoa da foto de referência em uma sala de treinamento, fazendo anotações durante um curso de atualização profissional. Tela com conteúdo técnico de lentes ao fundo. Expressão de interesse genuíno e crescimento profissional." },
  { sub: "Lifestyle", title: "O Retrato do Especialista", text: "A pessoa da foto de referência em retrato profissional de meio corpo, braços cruzados com confiança, usando óculos elegantes. Fundo de estúdio com gradiente suave. Iluminação profissional tipo Rembrandt. Ideal para LinkedIn, site da ótica ou cartão de visita." },
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
          <div className="grid grid-cols-4 gap-3">
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
                  <img src={item.url} alt={`FacePost ${i + 1}`} className="w-full h-auto object-contain" />
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
