import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: sequences } = await supabase
      .from("followup_sequences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ sequences: sequences || [] });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar sequências" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { title, description, category, steps } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });
    }

    const { data: sequence, error } = await supabase
      .from("followup_sequences")
      .insert({ user_id: user.id, title, description: description || null, category: category || "CUSTOM" })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Insert steps if provided
    if (steps?.length > 0 && sequence) {
      const stepsToInsert = steps.map((s: Record<string, unknown>, i: number) => ({
        sequence_id: sequence.id,
        step_order: i + 1,
        delay_minutes: s.delay_minutes || 0,
        allowed_hours_start: s.allowed_hours_start ?? 8,
        allowed_hours_end: s.allowed_hours_end ?? 20,
        allowed_days: s.allowed_days || [1, 2, 3, 4, 5],
        message_type: s.message_type || "TEXT",
        message_content: s.message_content || "",
        media_url: s.media_url || null,
      }));

      await supabase.from("followup_steps").insert(stepsToInsert);
    }

    return NextResponse.json({ id: sequence?.id });
  } catch {
    return NextResponse.json({ error: "Erro ao criar sequência" }, { status: 500 });
  }
}
