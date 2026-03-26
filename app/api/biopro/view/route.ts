import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ ok: true });

    const admin = createAdminSupabase();
    const { data } = await admin.from("linktrees").select("id, views_count").eq("slug", slug).single();
    if (data) {
      await admin.from("linktrees").update({ views_count: (data.views_count || 0) + 1 }).eq("id", data.id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
