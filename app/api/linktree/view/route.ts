import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const admin = createAdminSupabase();
    await admin.rpc("increment_linktree_views", { p_slug: slug }).catch(() => {
      // Fallback if RPC doesn't exist
      admin.from("linktrees").update({ views_count: admin.rpc("") }).eq("slug", slug);
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
