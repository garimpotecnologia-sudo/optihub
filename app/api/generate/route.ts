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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, credits, custom_api_key")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

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
    const { prompt, logo, referenceImage, tipo, estilo, ratio, tool, colors } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }

    // Send exactly what the user wrote — no modifications
    const enhancedPrompt = prompt;

    console.log("=== GENERATE REQUEST ===");
    console.log("Tool:", tool);
    console.log("Tipo:", tipo);
    console.log("Ratio:", ratio);
    console.log("Estilo:", estilo);
    console.log("Colors:", JSON.stringify(colors));
    console.log("Has logo:", !!logo);
    console.log("Has reference:", !!referenceImage);
    console.log("Prompt:", enhancedPrompt.slice(0, 200));

    const result = await generateImage({
      prompt: enhancedPrompt,
      logo: logo || undefined,
      referenceImage: referenceImage || undefined,
      aspectRatio: ratio,
      style: estilo,
      colors,
      tool: tool || "CRIADOR",
    });

    // Upload to Supabase Storage — always try to get a real URL
    let storedUrl = result.imageUrl;
    if (result.imageBase64) {
      try {
        const fileName = `${user.id}/${Date.now()}.png`;
        const buffer = Buffer.from(result.imageBase64, "base64");
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("generations")
          .upload(fileName, buffer, { contentType: "image/png" });

        if (uploadError) {
          console.error("Storage upload error:", uploadError.message);
        }

        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("generations")
            .getPublicUrl(uploadData.path);
          storedUrl = urlData.publicUrl;
          console.log("Image stored at:", storedUrl);
        } else {
          // Fallback: return truncated base64 data URL (browser can handle it)
          storedUrl = `data:image/png;base64,${result.imageBase64}`;
          console.log("Using base64 fallback, length:", result.imageBase64.length);
        }
      } catch (storageErr) {
        console.error("Storage error:", storageErr);
        storedUrl = `data:image/png;base64,${result.imageBase64}`;
      }
    }

    return NextResponse.json({
      imageUrl: storedUrl,
      tool: tool || "CRIADOR",
      prompt,
      metadata: { tipo, estilo, ratio },
      debug: {
        finalPrompt: result.finalPrompt,
        model: result.model,
        ratio,
        estilo,
        colors,
        hasLogo: !!logo,
        hasReference: !!referenceImage,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar imagem. Verifique sua API key." },
      { status: 500 }
    );
  }
}
