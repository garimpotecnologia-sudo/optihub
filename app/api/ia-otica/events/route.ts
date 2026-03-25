import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

// Webhook endpoint for external AI to post events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, event_type, metadata } = body;

    if (!user_id || !event_type) {
      return NextResponse.json({ error: "user_id e event_type são obrigatórios" }, { status: 400 });
    }

    if (!["ATTENDANCE", "HANDOFF", "QUOTE"].includes(event_type)) {
      return NextResponse.json({ error: "event_type inválido" }, { status: 400 });
    }

    const admin = createAdminSupabase();
    const { error } = await admin.from("ia_otica_events").insert({
      user_id,
      event_type,
      metadata: metadata || {},
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar evento" }, { status: 500 });
  }
}
