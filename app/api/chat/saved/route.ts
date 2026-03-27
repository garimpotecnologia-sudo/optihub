import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const MAX_SAVED = 20;

// GET — listar respostas salvas
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data, error } = await supabase
      .from("saved_responses")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ responses: data || [], count: data?.length || 0, max: MAX_SAVED });
  } catch (error) {
    console.error("Saved responses GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar respostas" }, { status: 500 });
  }
}

// POST — salvar resposta (máx 20)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { content } = await request.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
    }

    // Verificar limite
    const { count } = await supabase
      .from("saved_responses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count || 0) >= MAX_SAVED) {
      return NextResponse.json({ error: `Limite de ${MAX_SAVED} respostas salvas atingido. Delete alguma para salvar novas.` }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_responses")
      .insert({ user_id: user.id, content })
      .select("id, content, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ saved: data });
  } catch (error) {
    console.error("Saved responses POST error:", error);
    return NextResponse.json({ error: "Erro ao salvar resposta" }, { status: 500 });
  }
}

// DELETE — remover resposta
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const { error } = await supabase
      .from("saved_responses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Saved responses DELETE error:", error);
    return NextResponse.json({ error: "Erro ao deletar resposta" }, { status: 500 });
  }
}
