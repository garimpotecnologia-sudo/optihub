import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateImage } from "@/lib/nano-banana";

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 30,
  PRO: 500,
  REDE: Infinity,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Get profile & check credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, credits, custom_api_key")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Check monthly usage
    const { data: usageData } = await supabase.rpc("get_monthly_usage", {
      p_user_id: user.id,
    });

    const usage = usageData || 0;
    const limit = PLAN_LIMITS[profile.plan] || 30;

    if (usage >= limit) {
      return NextResponse.json(
        { error: "Limite de gerações atingido. Faça upgrade do plano." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { prompt, referenceImages, tipo, estilo, ratio, tool } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }

    // Build enhanced prompt
    let enhancedPrompt = prompt;
    if (tool === "CRIADOR" && tipo) {
      enhancedPrompt = `Create a ${tipo} for an optical store. ${prompt}`;
      if (estilo) enhancedPrompt += `. Visual style: ${estilo}`;
    }
    if (tool === "EDITOR") {
      enhancedPrompt = `Professional product photography edit: ${prompt}`;
    }

    const result = await generateImage({
      prompt: enhancedPrompt,
      referenceImages,
      aspectRatio: ratio,
      style: estilo,
    });

    // Upload image to Supabase Storage
    let storedUrl = result.imageUrl;
    if (result.imageBase64) {
      const fileName = `${user.id}/${Date.now()}.png`;
      const buffer = Buffer.from(result.imageBase64, "base64");
      const { data: uploadData } = await supabase.storage
        .from("generations")
        .upload(fileName, buffer, { contentType: "image/png" });

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("generations")
          .getPublicUrl(uploadData.path);
        storedUrl = urlData.publicUrl;
      }
    }

    // Save generation to database
    await supabase.from("generations").insert({
      user_id: user.id,
      tool: tool || "CRIADOR",
      prompt,
      image_url: storedUrl,
      input_urls: referenceImages || [],
      metadata: { tipo, estilo, ratio },
    });

    return NextResponse.json({ imageUrl: storedUrl });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar imagem. Verifique sua API key." },
      { status: 500 }
    );
  }
}
