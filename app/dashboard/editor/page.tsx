"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface SubOption { label: string; prompt: string; }
interface Action { id: string; label: string; icon: string; prompt: string; subOptions?: SubOption[]; }

const actions: Action[] = [
  {
    id: "remove-bg", label: "Remover Fundo", icon: "/editor-icons/remove-bg.png",
    prompt: "Remova completamente o fundo desta foto de produto de óculos. Mantenha o produto perfeitamente isolado com bordas limpas e nítidas. Coloque sobre fundo branco puro com uma sombra suave e natural embaixo da armação para dar profundidade. Preserve todos os detalhes do produto: texturas, reflexos, transparência das lentes e marcações da marca. Qualidade profissional de e-commerce, sensação de resolução 8K.",
  },
  {
    id: "lighting", label: "Ajustar Iluminação", icon: "/editor-icons/lighting.png",
    prompt: "Melhore a iluminação desta foto de produto de óculos para qualidade profissional de estúdio. Aplique iluminação de três pontos: luz principal forte vindo do canto superior esquerdo criando destaques limpos na armação, luz de preenchimento suave da direita para eliminar sombras duras, e uma luz de contorno sutil por trás para separar o produto do fundo. Faça as lentes parecerem cristalinas com reflexos naturais. Garanta que a textura do material da armação seja visível — superfícies brilhantes devem reluzir, superfícies foscas devem parecer aveludadas. Cores precisas, padrão de fotografia de produto de alto nível.",
  },
  {
    id: "lifestyle", label: "Cenário Lifestyle", icon: "/editor-icons/lifestyle.png",
    prompt: "Coloque este óculos em um cenário lifestyle aspiracional, com tratamento de cor cinematográfico, profundidade de campo rasa e iluminação natural de golden hour.",
    subOptions: [
      { label: "Mesa de café", prompt: "Coloque este óculos exato casualmente sobre uma mesa de café de madeira nogueira ao lado de uma xícara de latte de cerâmica e um livro de capa dura aberto. Luz dourada da manhã entrando por uma janela próxima, criando destaques quentes na armação. Profundidade de campo rasa com bokeh aconchegante de um apartamento moderno ao fundo. O óculos é o protagonista — foco nítido, cada detalhe visível. Fotografia editorial lifestyle, tons quentes, clima convidativo." },
      { label: "Beira da piscina", prompt: "Coloque este óculos exato na borda de uma piscina de borda infinita com vista para o oceano. Água cristalina turquesa, borda da piscina em mármore branco, uma toalha de luxo dobrada por perto. Luz brilhante de golden hour refletindo nas lentes com belo lens flare. Atmosfera de resort de verão de luxo, paleta de cores vibrante mas sofisticada. Fotografado com abertura ampla para bokeh cremoso ao fundo. Estética de revista de viagens premium." },
      { label: "Escritório moderno", prompt: "Coloque este óculos exato sobre uma mesa estilo escandinavo ao lado de um notebook e uma pequena planta monstera em vaso. Espaço de trabalho limpo e luminoso com janelas do chão ao teto mostrando o horizonte da cidade. Luz natural difusa e suave criando sombras delicadas. A armação está sobre um pad de couro. Lifestyle profissional moderno, composição limpa, setup aspiracional de home office. Estética Architectural Digest encontra fotografia de produto." },
      { label: "Bancada de mármore", prompt: "Coloque este óculos exato sobre uma bancada de mármore Calacatta com veios dourados, ao lado de um frasco de perfume elegante e uma pequena bandeja dourada. Iluminação ambiente suave e luxuosa vindo de cima com tons quentes. Os veios do mármore criam linhas naturais de condução até o produto. Estilo editorial premium de beleza e moda. Texturas ricas, paleta sofisticada de brancos, dourados e neutros quentes. Styling de produto nível Vogue." },
      { label: "Piquenique ao ar livre", prompt: "Coloque este óculos exato sobre uma manta de piquenique de linho creme em um parque ensolarado. Cercado por frutas frescas, um chapéu de palha e flores silvestres. Contraluz suave e sonhadora de golden hour filtrando pelas folhas das árvores criando belos círculos de bokeh. Paleta de cores natural e orgânica com verdes quentes e tons dourados. Clima lifestyle relaxado e livre. Estética de campanha de marca de moda, profundidade de campo rasa estilo Canon 85mm f/1.4." },
    ],
  },
  {
    id: "vitrine", label: "Cenário Vitrine", icon: "/editor-icons/vitrine.png",
    prompt: "Coloque este óculos em um display premium de loja de ótica com iluminação dramática e materiais luxuosos.",
    subOptions: [
      { label: "Vitrine premium", prompt: "Coloque este óculos exato dentro de uma vitrine de vidro premium com iluminação LED de precisão vindo de cima. Fundo de veludo preto profundo, a armação iluminada com luzes de destaque focadas criando um halo brilhante ao redor do produto. Luz de destaque neon sutil em roxo ou teal refletindo no vidro. Estética ultra-luxo de joalheria — estilo boutique Cartier ou Tom Ford. Contraste dramático, o óculos brilha como um objeto precioso. Fotografia de varejo sofisticada, moody e premium." },
      { label: "Expositor de madeira", prompt: "Coloque este óculos exato sobre um expositor artesanal de madeira nogueira com textura de veios visíveis. Iluminação de destaque âmbar quente vindo das laterais, criando sombras e destaques ricos na armação. Fundo de uma ótica boutique com prateleiras desfocadas de armações. Sensação artesanal e premium — como uma galeria curada de óculos independentes. Temperatura de cor quente, aconchegante mas luxuoso. Os veios da madeira e os detalhes da armação estão ambos em foco nítido." },
      { label: "Prateleira minimalista", prompt: "Coloque este óculos exato sobre uma prateleira flutuante de laca branca contra uma parede matte branca limpa. Spotlight dramático único vindo de cima projetando uma sombra precisa embaixo. Composição mínima e zen com espaço negativo generoso. Estética ultra-moderna de ótica boutique — Apple Store encontra eyewear de luxo. Linhas limpas, simetria perfeita, o produto é o ponto focal absoluto. Iluminação high-key, nítido e arquitetônico." },
      { label: "Display com espelho", prompt: "Coloque este óculos exato sobre uma superfície espelhada polida que cria um reflexo perfeito embaixo. Fundo escuro e moody com iluminação top-down focada. O reflexo no espelho adiciona profundidade e dobra o impacto visual do produto. Iluminação de destaque colorida sutil (roxo profundo ou esmeralda) visível no reflexo do espelho. Estilo de fotografia de produto de marcas de luxo como Dior ou Prada. Dramático, sleek e moderno." },
      { label: "Balcão de atendimento", prompt: "Coloque este óculos exato sobre um balcão de loja preto matte elegante com retroiluminação LED suave criando uma borda luminosa. Uma pequena bandeja de veludo de apresentação segura a armação. Fundo desfocado mostra interior de uma ótica moderna com iluminação ambiente quente. O balcão tem uma sensação sofisticada e acolhedora. O óculos está posicionado em leve ângulo, como se apresentado a um cliente. Fotografia de varejo, convidativa e premium." },
    ],
  },
  {
    id: "studio", label: "Cenário Estúdio", icon: "/editor-icons/studio.png",
    prompt: "Fotografia profissional de produto em estúdio deste óculos com iluminação controlada e fundos limpos.",
    subOptions: [
      { label: "Fundo branco infinito", prompt: "Coloque este óculos exato sobre um fundo branco infinito (ciclorama). Iluminação profissional de três pontos em estúdio: luz principal criando destaque especular limpo na armação, luz de preenchimento suavizando sombras, e contraluz para separação de bordas. Sombra natural sutil na superfície branca para ancoragem. O produto flutua no espaço branco limpo. Qualidade de imagem hero de e-commerce — cada detalhe afiado, cores fiéis à realidade. Sensação de câmera médio formato em f/11 para nitidez máxima." },
      { label: "Gradiente cinza", prompt: "Coloque este óculos exato flutuando contra um fundo degradê suave de carvão para cinza claro. Iluminação dramática de estúdio com softbox grande criando iluminação uniforme e profissional. O gradiente adiciona profundidade sem distrair. Reflexos de catchlight sutis nas lentes. Estilo de fotografia de catálogo premium — limpo, autoritativo e elegante. Composição centralizada com simetria perfeita." },
      { label: "Fundo colorido", prompt: "Coloque este óculos exato contra um fundo sólido vibrante e ousado (azul elétrico, rosa choque ou laranja vívido — escolha a cor que cria o contraste mais forte com a armação). Iluminação dura de estúdio criando sombras gráficas de alto contraste. Estilo pop art encontra editorial de alta moda. A armação se destaca dramaticamente contra o fundo saturado. Ousado, chamativo, pronto para Instagram. Estilo campanha Warby Parker encontra Andy Warhol — divertido, moderno e impossível de ignorar no feed." },
      { label: "Superfície refletiva", prompt: "Coloque este óculos exato sobre uma superfície de acrílico preto brilhante que cria um reflexo tipo espelho embaixo. Iluminação de estúdio com luzes laterais dramáticas criando destaques brilhantes nas bordas e contornos da armação. Fundo preto profundo desvanecendo para escuridão total. O reflexo na superfície é levemente difuso, adicionando sofisticação. Fotografia de produto estilo automotivo de luxo — como Rolex ou Ray-Ban fotografa seus produtos hero. Moody, poderoso, premium. Luz de destaque neon (roxa ou laranja) contornando sutilmente as bordas." },
      { label: "Sombra artística", prompt: "Coloque este óculos exato sobre uma superfície cor de areia quente ou creme com iluminação lateral dura e dramática vindo da esquerda, criando sombras geométricas longas e artísticas da armação. Simulação de sol de fim de tarde — luz quente e dourada com alto contraste. O padrão da sombra faz parte da composição, criando interesse visual. Estilo de fotografia editorial de moda — estética campanha Vogue Eyewear. Artístico, evocativo, storytelling através de luz e sombra. A interação entre o produto e sua sombra é o protagonista desta foto." },
    ],
  },
  {
    id: "variations", label: "Variações", icon: "/editor-icons/variations.png",
    prompt: "Gere variações criativas de produto deste óculos mantendo o design exato da armação.",
    subOptions: [
      { label: "Variação de cores", prompt: "Gere 4 variações de cor desta armação de óculos exata, dispostas lado a lado sobre fundo branco limpo. Mostre o mesmo design de armação em: preto brilhante clássico, tartaruga/havana quente, transparente cristal, e azul marinho profundo. Cada armação deve estar no mesmo ângulo e tamanho para fácil comparação. Layout de catálogo profissional com iluminação consistente em todas as variações. Limpo, organizado, pronto para e-commerce — perfeito para seletor de cores na página de produto." },
      { label: "Ângulos diferentes", prompt: "Mostre este óculos exato a partir de 4 ângulos profissionais diferentes arranjados em layout de grid limpo: vista frontal (de frente), ângulo de 3/4 da esquerda mostrando profundidade, vista de perfil lateral mostrando o design da haste, e vista de cima da armação dobrada. Fundo branco e iluminação de estúdio consistentes em todos os ângulos. Cada ângulo revela diferentes detalhes de design da armação. Padrão de fotografia de produto usado por sites premium de eyewear." },
      { label: "Diferentes lentes", prompt: "Mostre esta armação de óculos exata com 4 opções diferentes de lentes em layout de comparação limpo: lentes cristalinas prontas para grau, lentes degradê de fumê para transparente, lentes espelhadas azuis reflexivas, e lentes verdes clássicas G-15. Mesma armação, mesmo ângulo, mesma iluminação — apenas as lentes mudam. Cada variante com características distintas das lentes claramente visíveis. Estilo de catálogo óptico profissional." },
      { label: "Flat lay", prompt: "Crie uma composição premium flat lay fotografada diretamente de cima. Este óculos exato centralizado como protagonista, cercado por acessórios combinando: um estojo rígido estruturado, um pano de microfibra com branding sutil, uma caixa ou sleeve da marca, e um pequeno spray limpador de lentes. Todos os itens arranjados com precisão geométrica sobre superfície limpa de mármore ou linho. Estilizado com espaço negativo entre os itens. Estética de experiência de unboxing premium — apresentação nível Apple. Iluminação suave e uniforme de cima sem sombras duras." },
      { label: "Composição artística", prompt: "Crie uma composição editorial artística e dramática deste óculos exato. Posicione a armação em ângulo dinâmico sobre superfície escura com iluminação de destaque em cores neon — roxo vibrante e laranja elétrico brilhando nas bordas, reminiscente de óculos com LED neon. Iluminação rim dramática destacando a silhueta da armação. Atmosfera moody e cinematográfica com sombras profundas e iluminação seletiva. Editorial de alta moda encontra estética cyberpunk. O tipo de foto hero que faz parar no scroll — ousada, artística e inesquecível. Pretos profundos, destaques neon vívidos, detalhe do produto afiado como navalha." },
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
