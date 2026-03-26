import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// GET: buscar perfil do usuário
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get monthly usage
    const { data: usage } = await supabase.rpc("get_monthly_usage", {
      p_user_id: user.id,
    });

    // Get stats
    const { count: totalGenerations } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: totalLikes } = await supabase
      .from("community_posts")
      .select("likes_count")
      .eq("user_id", user.id);

    const response = NextResponse.json({
      ...profile,
      monthlyUsage: usage || 0,
      totalGenerations: totalGenerations || 0,
      totalLikes: totalLikes || 0,
    });
    response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

// PATCH: atualizar perfil
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = [
      "name", "optica_name", "optica_logo", "optica_address",
      "optica_brands", "custom_api_key",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key];
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
