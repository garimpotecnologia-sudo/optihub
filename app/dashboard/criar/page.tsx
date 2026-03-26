"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

const formatos = [
  { id: "post-feed", label: "Post Feed", desc: "Instagram / Facebook", ratio: "1:1", w: 40, h: 40 },
  { id: "post-retrato", label: "Post Retrato", desc: "Melhor engajamento", ratio: "4:5", w: 36, h: 48 },
  { id: "story", label: "Story / Reels", desc: "Instagram / TikTok", ratio: "9:16", w: 28, h: 50 },
  { id: "banner", label: "Banner", desc: "Site / Facebook Cover", ratio: "16:9", w: 50, h: 28 },
  { id: "catalogo", label: "Catálogo", desc: "Múltiplos produtos", ratio: "1:1", w: 40, h: 40 },
  { id: "cartao", label: "Cartão de Visita", desc: "Impressão", ratio: "16:9", w: 50, h: 28 },
];

const estilos = ["Moderno", "Minimalista", "Luxo", "Colorido", "Profissional"];

const promptsProntos = [
  { cat: "Promoção", text: "Crie um post para Instagram com promoção de 30% OFF em óculos de sol. CONCEITO: Um óculos de sol flutuando sobre um fundo degradê vibrante de laranja para magenta, com raios de luz irradiando por trás. Um selo grande e chamativo com '30% OFF' em tipografia bold moderna. ESTILO: Design gráfico contemporâneo, limpo e ousado. COMPOSIÇÃO: Óculos centralizado ocupando 40% da imagem, selo de desconto no canto superior direito, espaço para texto na parte inferior. CORES: Laranja quente, magenta vibrante, branco puro, amarelo ouro. TEXTURA: Gradientes suaves com brilho sutil nas lentes. EVITAR: Fotos de pessoas, fundos genéricos, excesso de texto pequeno." },
  { cat: "Promoção", text: "Crie um story urgente de oferta relâmpago para armações com até 50% de desconto. CONCEITO: Senso de urgência visual com um timer/relógio estilizado, bordas brilhantes pulsantes e armações elegantes dispostas em diagonal. ESTILO: Design de alta energia com movimento, como se as armações estivessem sendo 'reveladas'. COMPOSIÇÃO: Timer digital no topo, '50% OFF' enorme no centro com efeito neon, armações na parte inferior em ângulo dinâmico. CORES: Vermelho intenso, amarelo elétrico, preto profundo, branco para contraste. TEXTURA: Efeito de luz neon com brilho e reflexo nas superfícies. EVITAR: Layout estático, cores pastéis, textos longos." },
  { cat: "Promoção", text: "Crie um banner para site com liquidação de inverno em óculos de grau. CONCEITO: Cenário minimalista de inverno — flocos de neve sutis caindo sobre óculos de grau elegantes apoiados em superfície de veludo azul escuro. Um selo circular dourado com 'Liquidação de Inverno' em tipografia serifada. ESTILO: Elegante e sofisticado, editorial de moda de inverno. COMPOSIÇÃO: Formato 16:9, óculos posicionados na regra dos terços à esquerda, texto e selo à direita com bastante espaço negativo. CORES: Azul marinho profundo, dourado champagne, branco neve, cinza prata. TEXTURA: Veludo macio no fundo, flocos de neve delicados com desfoque. EVITAR: Excesso de decoração natalina, cores quentes, layout apertado." },
  { cat: "Promoção", text: "Crie um post carrossel mostrando 4 armações em promoção com preço antigo riscado e novo preço. CONCEITO: Cada slide apresenta uma armação diferente como estrela, flutuando sobre fundo limpo com gradiente sutil. Preço antigo riscado em vermelho e novo preço grande em verde/dourado. ESTILO: Catálogo premium de e-commerce com tratamento visual consistente. COMPOSIÇÃO: Armação centralizada em cada slide, nome do modelo acima, preços abaixo com destaque visual no desconto, numeração '1/4' discreta. CORES: Fundo branco gelo com gradiente cinza suave, vermelho para preço antigo, verde esmeralda ou dourado para novo preço. TEXTURA: Sombra suave sob cada armação para dar profundidade, fundo com textura quase imperceptível de linho. EVITAR: Fundos diferentes em cada slide, inconsistência de ângulo, fontes variadas." },
  { cat: "Lançamento", text: "Crie um post de lançamento da nova coleção de armações verão 2025. CONCEITO: Revelação cinematográfica — armações sendo iluminadas por um feixe de luz dourada vindo de cima, como se estivessem sendo 'desvendadas' pela primeira vez. Partículas douradas flutuando ao redor. ESTILO: Fashion editorial de alto luxo, campanha de marca premium. COMPOSIÇÃO: Armação principal em destaque no centro, levemente inclinada em ângulo dinâmico. 'Coleção Verão 2025' em tipografia fina e elegante na parte superior. Fundo claro com gradiente creme para branco. CORES: Dourado champagne, branco perolado, creme suave, toques de coral claro. TEXTURA: Brilho dourado nas partículas, acabamento sedoso no fundo. EVITAR: Cores escuras, tipografia pesada, excesso de elementos." },
  { cat: "Lançamento", text: "Crie um story anunciando a chegada de uma nova marca exclusiva na ótica. CONCEITO: Teaser misterioso com fundo escuro profundo e um feixe de luz revelando parcialmente uma armação luxuosa. Texto 'Em Breve' com efeito luminoso. ESTILO: Cinematográfico e intrigante, como trailer de filme de suspense. COMPOSIÇÃO: Vertical 9:16, armação parcialmente visível na metade inferior envolta em sombra, 'Em Breve' brilhando no centro com efeito de lens flare. Logo da marca sugerido em marca d'água sutil. CORES: Preto profundo, prata brilhante, azul escuro, branco luminoso. TEXTURA: Fumaça sutil no fundo, brilho especular na parte visível da armação. EVITAR: Revelar o produto inteiro, cores vibrantes, layout claro." },
  { cat: "Lançamento", text: "Crie um banner de lançamento de óculos de sol esportivos exclusivos. CONCEITO: Energia e movimento — o óculos esportivo em primeiro plano com efeito de velocidade (motion blur) no fundo, como se estivesse em alta velocidade. Elementos gráficos dinâmicos como linhas de velocidade e formas geométricas angulares. ESTILO: Design esportivo moderno, campanha Oakley ou Nike Vision. COMPOSIÇÃO: 16:9, óculos em ângulo de 3/4 ocupando o lado direito, texto 'Lançamento Exclusivo' em tipografia bold angular à esquerda, linhas de velocidade conectando ambos. CORES: Preto carbono, vermelho racing, prata metálico, branco puro. TEXTURA: Acabamento metálico nas superfícies, efeito de velocidade no fundo. EVITAR: Layout estático, cores pastéis, tipografia delicada." },
  { cat: "Datas", text: "Crie um post para Dia das Mães promovendo óculos femininos elegantes. CONCEITO: Homenagem delicada — uma armação feminina sofisticada apoiada sobre pétalas de rosa espalhadas, com luz suave dourada de golden hour. Fita de presente sutil ao redor. Texto 'Para a mulher mais especial' em caligrafia elegante. ESTILO: Editorial feminino premium, fotografia de produto lifestyle com toque emocional. COMPOSIÇÃO: Armação centralizada sobre as pétalas, texto na parte superior em arco suave, fundo com bokeh floral desfocado. CORES: Rosa blush, dourado rosé, branco pérola, verde suave das folhas. TEXTURA: Pétalas de seda, brilho suave dourado, fundo com desfoque cremoso. EVITAR: Rosa choque, corações genéricos, clipart, excesso de texto." },
  { cat: "Datas", text: "Crie uma arte de Natal com promoção de final de ano em óculos como presente perfeito. CONCEITO: Um óculos elegante dentro de uma caixa de presente aberta, com luz quente saindo de dentro da caixa como se fosse mágica. Decoração natalina minimalista e premium — ramos de pinheiro e uma estrela dourada. ESTILO: Premium e sofisticado, Natal minimalista escandinavo. COMPOSIÇÃO: Caixa de presente aberta no centro inferior, luz quente irradiando para cima, óculos emergindo da luz. 'Presente Perfeito' em tipografia serifada dourada na parte superior. Ramos de pinheiro nas laterais como moldura natural. CORES: Verde pinheiro escuro, dourado quente, vermelho borgonha sutil, branco neve. TEXTURA: Veludo na caixa, agulhas de pinheiro realistas, brilho dourado nas estrelas. EVITAR: Papai Noel, renas, excesso de vermelho e verde, visual infantil." },
  { cat: "Datas", text: "Crie um post de Dia dos Pais com armações masculinas clássicas e sofisticadas. CONCEITO: Sofisticação masculina atemporal — armação clássica apoiada sobre um livro antigo de capa de couro, ao lado de um relógio de pulso vintage. Luz direcional dramática como retrato de estúdio cinematográfico. ESTILO: Editorial masculino clássico, fotografia moody e elegante. COMPOSIÇÃO: Armação e acessórios na metade inferior seguindo a regra dos terços. 'Para quem te ensinou a ver o mundo' em tipografia forte e limpa na parte superior. Fundo escuro com textura sutil. CORES: Azul marinho profundo, marrom cognac, dourado antigo, cinza grafite. TEXTURA: Couro envelhecido do livro, metal escovado do relógio, superfície de madeira nobre. EVITAR: Cores claras, layout feminino, tipografia cursiva, clichês como gravata." },
  { cat: "Datas", text: "Crie um story de Black Friday com impacto visual máximo para armações e lentes. CONCEITO: Explosão de desconto — números gigantes '70% OFF' se fragmentando em pedaços 3D com iluminação neon. Armações premium flutuando entre os fragmentos. Timer de contagem regressiva estilizado no topo. ESTILO: Design gráfico de alta energia, cyberpunk meets luxury. COMPOSIÇÃO: Vertical 9:16, números enormes fragmentados ocupando 60% da imagem, armações flutuando entre eles, timer no topo, 'Black Friday' em neon na base. CORES: Preto absoluto, neon verde elétrico, neon roxo, branco puro para contraste. TEXTURA: Fragmentos 3D com reflexo metálico, glow neon nas bordas, fundo com partículas brilhantes. EVITAR: Vermelho e amarelo genéricos de 'promoção', layout limpo demais, visual 'baratinho'." },
  { cat: "Produto", text: "Crie uma foto de produto profissional de óculos estilo Aviator em fundo branco minimalista. CONCEITO: Produto como joia — o óculos aviator flutuando levemente sobre fundo branco infinito, com sombra suave e natural embaixo criando profundidade sutil. Reflexo perfeito nas lentes espelhadas mostrando um céu azul tênue. ESTILO: Fotografia de produto e-commerce premium, estilo Apple — ultra-limpo e sofisticado. COMPOSIÇÃO: Óculos centralizado em ângulo de 3/4, levemente inclinado para mostrar volume. Bastante espaço negativo ao redor. Foco total no produto com cada detalhe nítido: dobradiças, parafusos, textura do metal. CORES: Branco puro, prata brilhante, reflexo azul nas lentes, sombra cinza suave. TEXTURA: Metal polido com reflexos especulares, lentes espelhadas cristalinas. EVITAR: Fundos coloridos, elementos decorativos, sombras duras." },
  { cat: "Produto", text: "Crie uma apresentação lifestyle de armação feminina em cenário de café sofisticado. CONCEITO: Momento lifestyle aspiracional — a armação feminina pousada casualmente sobre uma mesa de café de madeira ao lado de um latte art perfeito, um livro aberto e uma suculenta pequena. Luz natural da manhã entrando por uma janela lateral. ESTILO: Fotografia lifestyle editorial, Instagram aesthetics premium — flat lay parcial com profundidade. COMPOSIÇÃO: Armação como protagonista em foco nítido, demais elementos em desfoque suave (bokeh). Ângulo de 45 graus, não totalmente de cima. Luz da janela criando sombras longas e suaves. CORES: Tons terrosos quentes — caramelo, bege, verde sage, madeira mel, branco creme. TEXTURA: Grão da madeira visível, espuma cremosa do café, páginas texturizadas do livro. EVITAR: Ângulo totalmente de cima (flat lay puro), cores frias, cenário artificial." },
  { cat: "Produto", text: "Crie um catálogo visual elegante com 6 modelos de armações de grau em grid organizado. CONCEITO: Catálogo premium — 6 armações diferentes dispostas em grid 3x2 perfeito, cada uma sobre fundo levemente diferente (variação sutil de cinza) para distinção. Nome do modelo em tipografia fina abaixo de cada armação. ESTILO: Editorial de catálogo de luxo, clean e sistemático como Mykita ou Lindberg. COMPOSIÇÃO: Grid simétrico 3x2 com espaçamento generoso entre cada produto. Todas as armações no mesmo ângulo frontal levemente inclinado. Título 'Coleção' elegante no topo. CORES: Fundo cinza em gradações sutis (do mais claro ao mais escuro), armações em cores variadas (preto, tartaruga, transparente, azul, bordô, dourado). TEXTURA: Fundo matte suave, acabamento nítido em cada armação. EVITAR: Fundos brancos puros, ângulos inconsistentes, layout desalinhado." },
  { cat: "Produto", text: "Crie uma imagem aspiracional de óculos de sol em cenário tropical de praia. CONCEITO: Lifestyle de verão — óculos de sol pousados na areia branca perto da água cristalina, com uma concha delicada e uma folha de palmeira parcialmente no quadro. Luz de golden hour com reflexo dourado nas lentes. ESTILO: Fotografia editorial de viagem luxury, Travel + Leisure meets eyewear campaign. COMPOSIÇÃO: Óculos na parte inferior do quadro em foco nítido, mar turquesa desfocado no fundo com bokeh dourado do pôr do sol. Concha e folha como props sutis. CORES: Turquesa do mar, areia dourada, coral sunset, verde tropical, céu rosa. TEXTURA: Grãos de areia com brilho, água cristalina, superfície das lentes refletindo o pôr do sol. EVITAR: Pessoas, cenário de piscina, cores artificiais, excesso de elementos." },
  { cat: "Institucional", text: "Crie um post institucional premium mostrando a fachada da ótica e a equipe profissional. CONCEITO: Primeiro contato acolhedor — fachada moderna da ótica com vitrine iluminada e bem organizada, equipe de 3-4 profissionais sorrindo naturalmente na entrada. Placa com nome da ótica visível e elegante. ESTILO: Fotografia corporativa moderna e humanizada, não engessada — estilo LinkedIn premium. COMPOSIÇÃO: Fachada ocupando 2/3 da imagem, equipe posicionada na entrada de forma natural (não em fila), nome da ótica legível no topo. Horário de golden hour para luz quente e acolhedora. CORES: Tons da marca da ótica harmonizados com a fachada, luz dourada quente, toques de verde de plantas na calçada. TEXTURA: Vidro da vitrine com reflexos suaves, fachada limpa e moderna. EVITAR: Poses artificiais, fachada vazia, iluminação fluorescente, aparência de foto genérica de banco de imagens." },
  { cat: "Institucional", text: "Crie uma arte moderna para 'Conheça Nossa Equipe' com espaços para fotos dos funcionários. CONCEITO: Apresentação humanizada — layout moderno com espaços circulares para fotos individuais da equipe, cada um com nome e função abaixo. Fundo com gradiente suave das cores da marca. Título 'Conheça Nossa Equipe' em tipografia moderna e acolhedora. ESTILO: Design corporativo contemporâneo, inspirado em sites de startups tech — limpo, humano e profissional. COMPOSIÇÃO: Título no topo, 4-6 espaços circulares para fotos dispostos em layout simétrico mas não rígido, nomes e funções em tipografia clara abaixo de cada círculo. CORES: Gradiente suave da cor primária da marca, branco para texto, cinza para subtítulos. TEXTURA: Gradiente smooth no fundo, bordas sutis nos círculos, sombra delicada. EVITAR: Layout de planilha, excesso de informação, fotos quadradas, design antigo de 'mural da equipe'." },
  { cat: "Institucional", text: "Crie um post de depoimento de cliente satisfeito com design premium e acolhedor. CONCEITO: Prova social elegante — aspas gigantes estilizadas emoldurando o depoimento do cliente, com espaço para foto circular do cliente ao lado. Estrelas de avaliação 5/5 em dourado. Design que transmite confiança e satisfação genuína. ESTILO: Editorial de testemunho, style Trustpilot premium — credível e elegante. COMPOSIÇÃO: Aspas grandes decorativas no topo esquerdo, texto do depoimento centralizado em itálico elegante, foto circular do cliente e nome no canto inferior direito, 5 estrelas douradas abaixo do depoimento. CORES: Fundo branco creme ou cinza muito claro, aspas em cor da marca em tom suave, estrelas douradas, texto em cinza escuro. TEXTURA: Fundo com textura sutil de papel premium, aspas com sombra leve. EVITAR: Fundo totalmente branco, estrelas coloridas, excesso de elementos gráficos, aparência de review falso." },
  { cat: "Institucional", text: "Crie um story mostrando bastidores da ótica com atendimento personalizado e cuidado profissional. CONCEITO: Behind the scenes autêntico — cena de um profissional ajustando cuidadosamente uma armação no rosto de um cliente, com ferramentas de precisão sobre a bancada. Ambiente acolhedor e profissional da ótica ao fundo. ESTILO: Fotografia documental lifestyle, storytelling visual autêntico — não posado. COMPOSIÇÃO: Vertical 9:16, mãos do profissional em foco ajustando a armação (close-up), rosto do cliente parcialmente visível com expressão satisfeita, bancada com ferramentas desfocada na parte inferior. Texto 'Cuidado em cada detalhe' sobreposto de forma elegante. CORES: Tons quentes naturais do ambiente, luz ambiente acolhedora, toques de branco e verde da marca. TEXTURA: Detalhes das ferramentas de precisão, textura da armação em close, bokeh suave do ambiente. EVITAR: Poses artificiais, ambiente clínico/hospitalar, excesso de texto, filtros exagerados." },
  { cat: "Educativo", text: "Crie um infográfico visual e didático explicando a diferença entre lentes monofocal, bifocal e multifocal. CONCEITO: Educação visual clara — três colunas comparativas mostrando cada tipo de lente com ilustração esquemática de como a visão funciona em cada uma. Ícones intuitivos de olho/visão para cada zona focal. ESTILO: Infográfico editorial limpo e moderno, estilo revista de saúde premium — didático sem ser clínico. COMPOSIÇÃO: Título educativo no topo, 3 colunas iguais (Monofocal | Bifocal | Multifocal), cada uma com: ilustração da lente, zonas de visão coloridas, lista de 3-4 benefícios, e indicação 'ideal para'. CORES: Azul confiança para monofocal, verde para bifocal, roxo para multifocal, fundo branco, texto cinza escuro. TEXTURA: Ilustrações com gradientes suaves nas zonas da lente, ícones flat com sombra mínima. EVITAR: Jargão técnico excessivo, fotos de olhos reais, design de apresentação PowerPoint, cores vibrantes demais." },
  { cat: "Educativo", text: "Crie um post educativo sobre como escolher o formato de armação ideal para cada tipo de rosto. CONCEITO: Guia visual prático — 4 formatos de rosto (redondo, quadrado, oval, coração) lado a lado, cada um com a silhueta do rosto e a armação ideal sobreposta. Dicas curtas abaixo de cada combinação. ESTILO: Infográfico fashion editorial, guia de estilo visual — como revista Esquire ou GQ. COMPOSIÇÃO: Título 'Armação Ideal para Seu Rosto' no topo, grid 2x2 com os 4 formatos, cada quadro com silhueta do rosto em cor suave e armação recomendada desenhada sobre ela. Nome do formato de rosto e 1 dica abaixo de cada. CORES: Fundo neutro claro, silhuetas em tons pastel diferenciados (rosa, azul, verde, lavanda), armações em preto ou dourado, texto cinza escuro. TEXTURA: Silhuetas com acabamento matte suave, armações com leve brilho metálico. EVITAR: Fotos reais de rostos, excesso de texto, design cluttered, cores primárias fortes." },
  { cat: "Educativo", text: "Crie um post educativo sobre a importância da proteção UV nos óculos de sol e como identificar lentes de qualidade. CONCEITO: Conscientização premium — ilustração elegante mostrando raios UV sendo bloqueados por uma lente de qualidade versus passando por uma lente genérica. Selo de certificação UV400 em destaque dourado. ESTILO: Infográfico científico-editorial, estilo Nature meets fashion magazine — informativo e sofisticado. COMPOSIÇÃO: Dividido em duas metades — lado esquerdo mostra lente de qualidade bloqueando raios UV (com selo UV400), lado direito mostra lente genérica deixando passar (com ícone de alerta). 3 dicas rápidas para identificar qualidade na parte inferior. CORES: Azul escuro para UV, dourado para proteção/certificação, vermelho sutil para alerta, fundo claro. TEXTURA: Raios UV com efeito de luz translúcida, lentes com acabamento realista. EVITAR: Tom alarmista, imagens de danos nos olhos, excesso de texto científico, design escolar." },
];

const categorias = ["Todos", "Promoção", "Lançamento", "Datas", "Produto", "Institucional", "Educativo"];

export default function CriarPage() {
  const [prompt, setPrompt] = useState("");
  const [formato, setFormato] = useState(formatos[0]);
  const [estilo, setEstilo] = useState("Moderno");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<{ url: string; saved: boolean; saving: boolean; debug?: any }[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savedLogo, setSavedLogo] = useState<string | null>(null);
  const [useLogo, setUseLogo] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [promptCat, setPromptCat] = useState("Todos");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondary1, setSecondary1] = useState("");
  const [secondary2, setSecondary2] = useState("");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const colors = (primaryColor || secondary1 || secondary2) ? {
        primary: primaryColor || undefined,
        secondary1: secondary1 || undefined,
        secondary2: secondary2 || undefined,
      } : undefined;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          tipo: formato.label,
          estilo,
          ratio: formato.ratio,
          tool: "CRIADOR",
          logo: useLogo && logo ? logo : undefined,
          referenceImage: refImage || undefined,
          colors,
        }),
      });
      const data = await res.json();
      console.log("API response:", { imageUrl: data.imageUrl?.slice(0, 80), error: data.error, debug: data.debug });
      if (data.error) {
        alert(`Erro: ${data.error}`);
      } else if (data.imageUrl) {
        setResults((prev) => [{ url: data.imageUrl, saved: false, saving: false, debug: data.debug }, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao gerar:", err);
      alert(`Erro de conexão: ${err}`);
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

        {/* Cores */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">
            Cores da Arte
            <span className="font-normal normal-case tracking-normal ml-1 text-text-muted/60">(opcional)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cor primária */}
            <div>
              <span className="block text-[11px] text-text-muted mb-1.5">Cor primária</span>
              <div className="flex items-center gap-2">
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={primaryColor || "#03FF94"}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-border hover:border-border-hover transition-colors"
                    style={{ backgroundColor: primaryColor || "#1a3530" }}
                  />
                </label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="Ex: #FF5500"
                  className="input-glow flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-xs font-mono"
                />
                {primaryColor && (
                  <button onClick={() => setPrimaryColor("")} className="text-text-muted hover:text-accent-rose text-xs transition-colors">✕</button>
                )}
              </div>
            </div>

            {/* Cor secundária 1 */}
            <div>
              <span className="block text-[11px] text-text-muted mb-1.5">Secundária 1</span>
              <div className="flex items-center gap-2">
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={secondary1 || "#59D4D1"}
                    onChange={(e) => setSecondary1(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-border hover:border-border-hover transition-colors"
                    style={{ backgroundColor: secondary1 || "#1a3530" }}
                  />
                </label>
                <input
                  type="text"
                  value={secondary1}
                  onChange={(e) => setSecondary1(e.target.value)}
                  placeholder="Ex: #0088FF"
                  className="input-glow flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-xs font-mono"
                />
                {secondary1 && (
                  <button onClick={() => setSecondary1("")} className="text-text-muted hover:text-accent-rose text-xs transition-colors">✕</button>
                )}
              </div>
            </div>

            {/* Cor secundária 2 */}
            <div>
              <span className="block text-[11px] text-text-muted mb-1.5">Secundária 2</span>
              <div className="flex items-center gap-2">
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={secondary2 || "#fbbf24"}
                    onChange={(e) => setSecondary2(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-border hover:border-border-hover transition-colors"
                    style={{ backgroundColor: secondary2 || "#1a3530" }}
                  />
                </label>
                <input
                  type="text"
                  value={secondary2}
                  onChange={(e) => setSecondary2(e.target.value)}
                  placeholder="Ex: #FFD700"
                  className="input-glow flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none transition-all text-xs font-mono"
                />
                {secondary2 && (
                  <button onClick={() => setSecondary2("")} className="text-text-muted hover:text-accent-rose text-xs transition-colors">✕</button>
                )}
              </div>
            </div>
          </div>
          {(primaryColor || secondary1 || secondary2) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] text-text-muted">Preview:</span>
              <div className="flex gap-1.5">
                {primaryColor && <div className="w-6 h-6 rounded-md border border-border" style={{ backgroundColor: primaryColor }} title={`Primária: ${primaryColor}`} />}
                {secondary1 && <div className="w-6 h-6 rounded-md border border-border" style={{ backgroundColor: secondary1 }} title={`Secundária 1: ${secondary1}`} />}
                {secondary2 && <div className="w-6 h-6 rounded-md border border-border" style={{ backgroundColor: secondary2 }} title={`Secundária 2: ${secondary2}`} />}
              </div>
              <button
                onClick={() => { setPrimaryColor(""); setSecondary1(""); setSecondary2(""); }}
                className="text-[10px] text-text-muted hover:text-accent-rose transition-colors ml-2"
              >
                Limpar cores
              </button>
            </div>
          )}
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
                <div className="bg-bg-card-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={`Geração ${i + 1}`} className="w-full h-auto object-contain" />
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

                  {/* Debug info */}
                  {item.debug && (
                    <details className="mt-2">
                      <summary className="text-[10px] text-text-muted cursor-pointer hover:text-text-secondary">
                        Ver prompt enviado
                      </summary>
                      <div className="mt-1.5 p-2.5 rounded-lg bg-bg-deep border border-border text-[10px] font-mono text-text-muted space-y-1 max-h-60 overflow-y-auto">
                        <div><span className="text-accent-green">modelo:</span> {item.debug.model || "?"}</div>
                        <div><span className="text-accent-green">ratio:</span> {item.debug.ratio}</div>
                        <div><span className="text-accent-green">estilo:</span> {item.debug.estilo}</div>
                        <div><span className="text-accent-green">cores:</span> {JSON.stringify(item.debug.colors || "nenhuma")}</div>
                        <div><span className="text-accent-green">logo enviada:</span> {item.debug.hasLogo ? "SIM" : "não"}</div>
                        <div><span className="text-accent-green">referência enviada:</span> {item.debug.hasReference ? "SIM" : "não"}</div>
                        <div className="pt-1 border-t border-border mt-1">
                          <span className="text-accent-amber">prompt FINAL enviado ao Gemini:</span>
                          <pre className="whitespace-pre-wrap mt-1 text-text-secondary leading-relaxed">{item.debug.finalPrompt}</pre>
                        </div>
                      </div>
                    </details>
                  )}
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
