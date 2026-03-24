import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// GET: listar posts da comunidade
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "recentes";
    const tool = searchParams.get("tool");

    let query = supabase
      .from("community_posts")
      .select(`
        *,
        user:profiles(name, optica_name, image),
        generation:generations(image_url, prompt, tool)
      `)
      .limit(30);

    if (tool) {
      query = query.eq("generation.tool", tool);
    }

    if (sort === "populares") {
      query = query.order("likes_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Community error:", error);
    return NextResponse.json({ error: "Erro ao carregar comunidade" }, { status: 500 });
  }
}

// POST: compartilhar geração na comunidade
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { generationId, description } = await request.json();

    // Mark generation as shared
    await supabase
      .from("generations")
      .update({ shared: true })
      .eq("id", generationId)
      .eq("user_id", user.id);

    // Create community post
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        generation_id: generationId,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Erro ao compartilhar" }, { status: 500 });
  }
}
