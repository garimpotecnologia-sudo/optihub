import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data } = await supabase.from("linktrees").select("*").eq("user_id", user.id).single();
    return NextResponse.json({ linktree: data || null });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const { slug, title, bio, cover_image, logo, cover_position, logo_position, primary_color, secondary_color, text_color, buttons, is_published } = body;

    if (!slug || slug.length < 3) return NextResponse.json({ error: "Slug deve ter pelo menos 3 caracteres" }, { status: 400 });
    if (/[^a-z0-9-]/.test(slug)) return NextResponse.json({ error: "Slug só pode ter letras minúsculas, números e hífens" }, { status: 400 });

    const reserved = ["login", "register", "dashboard", "admin", "api", "linktree"];
    if (reserved.includes(slug)) return NextResponse.json({ error: "Este slug é reservado" }, { status: 400 });

    if (buttons && buttons.length > 10) return NextResponse.json({ error: "Máximo de 10 botões" }, { status: 400 });

    // Check if user already has a linktree
    const { data: existing } = await supabase.from("linktrees").select("id").eq("user_id", user.id).single();

    const payload = {
      slug,
      title: title || null,
      bio: bio || null,
      cover_image: cover_image || null,
      logo: logo || null,
      cover_position: cover_position || "50% 50%",
      logo_position: logo_position || "50% 50%",
      primary_color: primary_color || "#03FF94",
      secondary_color: secondary_color || "#0C1A14",
      text_color: text_color || "#FFFFFF",
      buttons: buttons || [],
      is_published: is_published !== false,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase.from("linktrees").update(payload).eq("id", existing.id);
      if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "Este slug já está em uso" }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("linktrees").insert({ ...payload, user_id: user.id });
      if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "Este slug já está em uso" }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
