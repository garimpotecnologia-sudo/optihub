import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const CLIPROXY_URL = "https://ia.otimusclinic.com.br/v1/chat/completions";
const CLIPROXY_KEY = "sk-oc-5fd55097277e4c3e4b3a1ce5ef7fbd077020f8d4d75b3c33";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { theme, slideCount = 5 } = await request.json();
    if (!theme || typeof theme !== "string") return NextResponse.json({ error: "Informe o tema do carrossel" }, { status: 400 });

    const numSlides = Math.min(Math.max(Number(slideCount) || 5, 1), 7);

    const prompt = `Crie DUAS variações de copy para um carrossel de Instagram com ${numSlides} slides sobre o tema: "${theme}"

REGRAS:
- Slide 1 deve ser um gancho forte que prende atenção
- Último slide deve ter CTA ou conclusão marcante
- Cada slide cria curiosidade pro próximo
- Linguagem direta, assertiva, storytelling brasileiro
- Variar tamanho dos headlines (entre 3 e 12 palavras)
- O campo imageDescription deve ser em INGLÊS, descritivo, pensando em stock photo ou geração de imagem

Responda EXCLUSIVAMENTE em JSON válido, sem markdown:
{
  "variationA": {
    "slides": [
      {"headline":"TEXTO PRINCIPAL","body":"texto de apoio (máx 20 palavras)","imageDescription":"English description of ideal background image for this slide, detailed, photographic style"}
    ]
  },
  "variationB": {
    "slides": [
      {"headline":"TEXTO PRINCIPAL","body":"texto de apoio (máx 20 palavras)","imageDescription":"English description of ideal background image for this slide, detailed, photographic style"}
    ]
  }
}

Cada variação DEVE ter exatamente ${numSlides} slides.
Variação A: tom profissional e técnico.
Variação B: tom descontraído e próximo.`;

    const res = await fetch(CLIPROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLIPROXY_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: [
          { role: "system", content: "Você é um copywriter brasileiro expert em carrosséis de Instagram que viralizam. Retorne APENAS JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    const llmData = await res.json();
    const rawText = llmData?.choices?.[0]?.message?.content || "";

    // Parse JSON
    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "Erro ao processar resposta da IA", raw: rawText.slice(0, 500) }, { status: 500 });
    }

    if (!parsed.variationA?.slides || !parsed.variationB?.slides) {
      return NextResponse.json({ error: "IA não gerou variações válidas" }, { status: 500 });
    }

    return NextResponse.json({
      variationA: parsed.variationA,
      variationB: parsed.variationB,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status: 500 });
  }
}
