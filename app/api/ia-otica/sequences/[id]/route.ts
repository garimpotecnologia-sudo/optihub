import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: sequence } = await supabase
      .from("followup_sequences")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!sequence) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const { data: steps } = await supabase
      .from("followup_steps")
      .select("*")
      .eq("sequence_id", id)
      .order("step_order", { ascending: true });

    return NextResponse.json({ sequence: { ...sequence, steps: steps || [] } });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const { title, description, category, is_active, steps } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (is_active !== undefined) updates.is_active = is_active;

    await supabase.from("followup_sequences").update(updates).eq("id", id).eq("user_id", user.id);

    // Replace steps if provided
    if (steps) {
      await supabase.from("followup_steps").delete().eq("sequence_id", id);
      if (steps.length > 0) {
        const stepsToInsert = steps.map((s: Record<string, unknown>, i: number) => ({
          sequence_id: id,
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
    }

    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    await supabase.from("followup_sequences").delete().eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
