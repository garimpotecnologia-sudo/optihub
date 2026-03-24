import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const API_URL =
  process.env.NANO_BANANA_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
const API_KEY = process.env.NANO_BANANA_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Get profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("optica_name, optica_brands")
      .eq("id", user.id)
      .single();

    const { messages } = await request.json();

    const brandsInfo = profile?.optica_brands?.length
      ? `A ótica trabalha com as marcas: ${profile.optica_brands.join(", ")}.`
      : "";

    const opticaInfo = profile?.optica_name
      ? `O nome da ótica é: ${profile.optica_name}.`
      : "";

    const systemPrompt = `Você é um assistente de vendas especializado em óticas. ${opticaInfo} ${brandsInfo}

Você conhece profundamente sobre:
- Tipos de lentes (monofocal, bifocal, multifocal/progressiva, transitions, antirreflexo)
- Marcas de armações (Ray-Ban, Oakley, Prada, Gucci, Mormaii, Ana Hickmann, etc)
- Materiais (acetato, metal, titânio, TR90)
- Tipos de rosto e armações ideais
- Proteção UV e lentes de sol
- Técnicas de vendas para óticas

Responda sempre de forma simpática, profissional e em português brasileiro.`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Save messages to DB
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg) {
      await supabase.from("chat_messages").insert([
        { user_id: user.id, role: "user", content: lastUserMsg.content },
        { user_id: user.id, role: "assistant", content: textContent },
      ]);
    }

    return NextResponse.json({ response: textContent });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Erro ao processar mensagem" }, { status: 500 });
  }
}
