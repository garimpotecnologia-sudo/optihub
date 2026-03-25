import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (adminProfile?.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const admin = createAdminSupabase();

    const { data: profile } = await admin.from("profiles").select("*").eq("id", id).single();
    if (!profile) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const { data: subscriptions } = await admin.from("subscriptions").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(5);
    const { data: productSubs } = await admin.from("product_subscriptions").select("*").eq("user_id", id).order("created_at", { ascending: false });
    const { data: recentGenerations } = await admin.from("generations").select("id, tool, prompt, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10);

    return NextResponse.json({ profile, subscriptions, productSubs, recentGenerations });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (adminProfile?.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const body = await request.json();
    const allowed = ["name", "plan", "role", "credits"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    const admin = createAdminSupabase();
    const { error } = await admin.from("profiles").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
