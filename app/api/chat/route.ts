import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { SYSTEM_PROMPT } from "./system-prompt";

const CLIPROXY_URL = "https://ia.otimusclinic.com.br/v1/chat/completions";
const CLIPROXY_KEY = "sk-oc-5fd55097277e4c3e4b3a1ce5ef7fbd077020f8d4d75b3c33";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("optica_name, optica_brands")
      .eq("id", user.id)
      .single();

    const { messages } = await request.json();

    const brandsInfo = profile?.optica_brands?.length
      ? `\nA ótica trabalha com as marcas: ${profile.optica_brands.join(", ")}.`
      : "";
    const opticaInfo = profile?.optica_name
      ? `\nO nome da ótica é: ${profile.optica_name}.`
      : "";

    const fullSystemPrompt = `${SYSTEM_PROMPT}${opticaInfo}${brandsInfo}`;

    const res = await fetch(CLIPROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLIPROXY_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("CLIProxy error:", res.status, errText);
      throw new Error(`CLIProxy error: ${res.status}`);
    }

    const data = await res.json();
    const textContent = data?.choices?.[0]?.message?.content || "";

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
