import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// POST: salvar na galeria
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { imageUrl, tool, prompt, metadata } = await request.json();

    const { data, error } = await supabase.from("generations").insert({
      user_id: user.id,
      tool: tool || "CRIADOR",
      prompt: prompt || "",
      image_url: imageUrl,
      input_urls: [],
      metadata: metadata || {},
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ saved: true, id: data.id });
  } catch (error) {
    console.error("Gallery save error:", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

// DELETE: remover da galeria
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { id } = await request.json();

    await supabase.from("generations").delete().eq("id", id).eq("user_id", user.id);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}
