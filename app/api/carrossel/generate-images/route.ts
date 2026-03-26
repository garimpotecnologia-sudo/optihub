import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { generateImage } from "@/lib/nano-banana";

const CLIPROXY_URL = "https://ia.otimusclinic.com.br/v1/chat/completions";
const CLIPROXY_KEY = "sk-oc-5fd55097277e4c3e4b3a1ce5ef7fbd077020f8d4d75b3c33";

// Step 1: Expand imageDescription into a full image generation prompt
async function expandPrompt(imageDescription: string, theme: string, palette: string, style: string): Promise<string> {
  const res = await fetch(CLIPROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLIPROXY_KEY}`,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      messages: [
        {
          role: "system",
          content: `You are an expert at crafting image generation prompts for AI image generators (like Imagen, DALL-E, Midjourney). You transform short descriptions into detailed, photographic prompts.

Rules:
- Output ONLY the prompt, no explanations
- Include: subject, composition, lighting, color palette, mood, style
- Style: professional editorial photography for Instagram
- Aspect ratio: 4:5 portrait
- NO text in the image
- Colors should complement: ${palette}
- Visual style: ${style}
- The image will be used as a BACKGROUND with text overlay, so avoid central focal points that would clash with overlaid text`
        },
        {
          role: "user",
          content: `Theme: ${theme}\nDescription: ${imageDescription}\n\nGenerate the full image prompt:`
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || imageDescription;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { slides, theme, palette, style } = await request.json();

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides inválidos" }, { status: 400 });
    }

    const admin = createAdminSupabase();

    // Process slides in batches of 2
    const results = [];
    for (let i = 0; i < slides.length; i += 2) {
      const batch = slides.slice(i, i + 2);
      const batchResults = await Promise.all(
        batch.map(async (slide: { headline: string; body: string; imageDescription: string }, batchIdx: number) => {
          const idx = i + batchIdx;
          try {
            // Step 1: Expand prompt
            const fullPrompt = await expandPrompt(
              slide.imageDescription,
              theme || "",
              palette || "dark with green accents",
              style || "impacto"
            );

            // Step 2: Generate image via Nano Banana (Imagen 4)
            const result = await generateImage({
              prompt: fullPrompt,
              aspectRatio: "4:5",
              tool: "CARROSSEL",
            });

            // Step 3: Upload to Supabase Storage
            let imageUrl = result.imageUrl;

            if (result.imageBase64) {
              const buffer = Buffer.from(result.imageBase64, "base64");
              const fileName = `carrossel/${user.id}/slide-${idx}-${Date.now()}.png`;
              const { error: uploadErr } = await admin.storage
                .from("generations")
                .upload(fileName, buffer, { contentType: "image/png", upsert: true });

              if (!uploadErr) {
                const { data: urlData } = admin.storage.from("generations").getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
              }
            }

            return {
              ...slide,
              imageUrl,
              imagePrompt: fullPrompt,
              index: idx,
            };
          } catch (error) {
            console.error(`Slide ${idx} image generation failed:`, error);
            return {
              ...slide,
              imageUrl: null,
              imagePrompt: null,
              index: idx,
            };
          }
        })
      );
      results.push(...batchResults);
    }

    return NextResponse.json({ slides: results });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status: 500 });
  }
}
