import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: dates } = await supabase
      .from("scheduling_blocked_dates")
      .select("*")
      .eq("user_id", user.id)
      .order("blocked_date", { ascending: true });

    return NextResponse.json({ dates: dates || [] });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { blocked_date, reason } = await request.json();
    if (!blocked_date) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 });

    const { data, error } = await supabase
      .from("scheduling_blocked_dates")
      .insert({ user_id: user.id, blocked_date, reason })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ date: data });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await supabase.from("scheduling_blocked_dates").delete().eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
