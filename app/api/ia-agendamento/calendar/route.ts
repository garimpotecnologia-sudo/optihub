import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const start = request.nextUrl.searchParams.get("start");
    const end = request.nextUrl.searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start e end são obrigatórios" }, { status: 400 });
    }

    const { data: appointments } = await supabase
      .from("scheduling_appointments")
      .select("*")
      .eq("user_id", user.id)
      .gte("appointment_date", start)
      .lte("appointment_date", end)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    return NextResponse.json({ appointments: appointments || [] });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
