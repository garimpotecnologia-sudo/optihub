import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const TEMPLATES: Record<string, { name: string; systemPrompt: string }> = {
  promocao: {
    name: "Promoção Especial",
    systemPrompt: "Crie um carrossel de 9 slides para Instagram de uma ótica promovendo armações e óculos em promoção. Use headlines impactantes com senso de urgência, dados de desconto, e CTAs fortes. Cada slide deve progredir a narrativa: hook → problema → solução → prova → oferta → CTA.",
  },
  saude: {
    name: "Saúde Ocular",
    systemPrompt: "Crie um carrossel educativo de 9 slides sobre saúde ocular e cuidados com a visão. Use dados reais, dicas práticas e linguagem acessível. Progressão: hook impactante → dados alarmantes → problema comum → sintomas → solução → prevenção → dica prática → resumo → CTA para consulta.",
  },
  tendencias: {
    name: "Tendências Eyewear",
    systemPrompt: "Crie um carrossel de 9 slides sobre tendências de óculos e eyewear do momento. Mostre formatos, cores, materiais e estilos em alta. Progressão: hook visual → tendência 1 → tendência 2 → tendência 3 → como usar → combinações → erros a evitar → resumo → CTA.",
  },
  antes_depois: {
    name: "Antes e Depois",
    systemPrompt: "Crie um carrossel de 9 slides mostrando transformações visuais com óculos novos. Foque na mudança de autoestima e estilo. Progressão: hook emocional → o problema → impacto na autoestima → a transformação → casos de sucesso → diferentes estilos → antes/depois → resultado → CTA.",
  },
  mitos: {
    name: "Mitos vs Verdades",
    systemPrompt: "Crie um carrossel de 9 slides desmistificando crenças populares sobre óculos e lentes. Formato mito/verdade com explicações claras. Progressão: hook polêmico → mito 1 → verdade 1 → mito 2 → verdade 2 → mito 3 → verdade 3 → resumo → CTA para consulta.",
  },
  guia_armacoes: {
    name: "Guia de Armações",
    systemPrompt: "Crie um carrossel de 9 slides sobre como escolher a armação ideal para cada tipo de rosto. Guia visual prático. Progressão: hook → rosto redondo → rosto quadrado → rosto oval → rosto coração → dicas gerais → erros comuns → checklist → CTA.",
  },
  colecao: {
    name: "Nova Coleção",
    systemPrompt: "Crie um carrossel de 9 slides apresentando uma nova coleção de armações com storytelling de marca. Progressão: teaser misterioso → revelação → destaque 1 → destaque 2 → destaque 3 → materiais e qualidade → exclusividade → como adquirir → CTA.",
  },
  depoimentos: {
    name: "Depoimentos",
    systemPrompt: "Crie um carrossel de 9 slides com depoimentos de clientes satisfeitos da ótica. Formato social proof. Progressão: hook com estatística → depoimento 1 → depoimento 2 → depoimento 3 → depoimento 4 → o que os clientes mais valorizam → nossa missão → convite → CTA.",
  },
  bastidores: {
    name: "Bastidores da Ótica",
    systemPrompt: "Crie um carrossel de 9 slides mostrando bastidores e dia a dia de uma ótica profissional. Humanize a marca. Progressão: hook → abertura da loja → atendimento → ajuste de armação → laboratório → equipe → cuidado com detalhes → compromisso → CTA.",
  },
  protecao_uv: {
    name: "Proteção UV",
    systemPrompt: "Crie um carrossel de 9 slides sobre a importância da proteção UV nos óculos de sol. Educativo e conscientizador. Progressão: hook alarmante → o que é UV → riscos → dados → como se proteger → diferença de lentes → selo UV400 → checklist → CTA.",
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { template, customTema, colors, slideCount = 9 } = await request.json();
    const numSlides = Math.min(Math.max(Number(slideCount) || 9, 3), 12);

    const tmpl = TEMPLATES[template];
    if (!tmpl) return NextResponse.json({ error: "Template inválido" }, { status: 400 });

    const colorInstruction = colors?.primary
      ? `Use a paleta de cores: primária ${colors.primary}${colors.secondary1 ? `, secundária ${colors.secondary1}` : ""}${colors.secondary2 ? `, terciária ${colors.secondary2}` : ""}.`
      : "Use cores profissionais e harmoniosas típicas do nicho óptico.";

    const customInstruction = customTema ? `\nTema/ângulo personalizado: ${customTema}` : "";

    // Replace hardcoded "9 slides" in template prompt with actual count
    const adjustedSystemPrompt = tmpl.systemPrompt.replace(/\b9 slides\b/g, `${numSlides} slides`);

    const prompt = `${adjustedSystemPrompt}${customInstruction}

${colorInstruction}

IMPORTANTE: Gere exatamente ${numSlides} slides, nem mais nem menos.

Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem comentários. O formato deve ser:
[
  {"order":1,"headline":"TÍTULO SLIDE 1","body":"Texto de apoio do slide 1 (2-3 linhas)","imagePrompt":"Prompt detalhado em português para gerar a imagem de fundo deste slide. Tema: ótica/óculos. Estilo: fotografia editorial premium para Instagram. Formato: quadrado 1:1."},
  {"order":2,...},
  ...até order ${numSlides}
]

Cada imagePrompt deve ser um prompt completo e detalhado para geração de imagem por IA, incluindo: conceito visual, estilo, composição, cores, textura. Focado em ótica/eyewear. SEM texto na imagem.`;

    // Generate 3 variations in parallel via CLIProxy
    const generateOne = async (): Promise<unknown[] | null> => {
      try {
        const res = await fetch("https://ia.otimusclinic.com.br/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-oc-5fd55097277e4c3e4b3a1ce5ef7fbd077020f8d4d75b3c33",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            messages: [
              { role: "system", content: "Você é um especialista em marketing digital e copywriting para óticas." },
              { role: "user", content: prompt },
            ],
            temperature: 0.9,
            max_tokens: 4096,
          }),
        });
        const data = await res.json();
        const rawText = data?.choices?.[0]?.message?.content || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
      } catch {
        return null;
      }
    };

    const results = await Promise.all([generateOne(), generateOne(), generateOne()]);
    const variations = results.filter((r): r is unknown[] => r !== null);

    if (variations.length === 0) {
      return NextResponse.json({ error: "IA não gerou slides válidos em nenhuma variação" }, { status: 500 });
    }

    return NextResponse.json({ variations, template: tmpl.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status: 500 });
  }
}
