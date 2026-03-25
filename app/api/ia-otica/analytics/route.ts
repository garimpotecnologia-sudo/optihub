import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const period = request.nextUrl.searchParams.get("period") || "day";

    let since: Date;
    const now = new Date();
    if (period === "week") {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      since = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const { data: events } = await supabase
      .from("ia_otica_events")
      .select("event_type")
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString());

    const counts = { attendance: 0, handoff: 0, quote: 0 };
    for (const e of events || []) {
      if (e.event_type === "ATTENDANCE") counts.attendance++;
      else if (e.event_type === "HANDOFF") counts.handoff++;
      else if (e.event_type === "QUOTE") counts.quote++;
    }

    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar analytics" }, { status: 500 });
  }
}
