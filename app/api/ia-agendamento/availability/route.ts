import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: availability } = await supabase
      .from("scheduling_availability")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_week", { ascending: true });

    return NextResponse.json({ availability: availability || [] });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { availability } = await request.json();

    // Upsert each day
    for (const day of availability) {
      await supabase.from("scheduling_availability").upsert(
        {
          user_id: user.id,
          day_of_week: day.day_of_week,
          is_available: day.is_available,
          start_time: day.start_time,
          end_time: day.end_time,
          slot_duration_minutes: day.slot_duration_minutes,
        },
        { onConflict: "user_id,day_of_week" }
      );
    }

    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
