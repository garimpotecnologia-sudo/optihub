import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const admin = createAdminSupabase();
    const statusFilter = request.nextUrl.searchParams.get("status") || "";
    const type = request.nextUrl.searchParams.get("type") || "main";

    const table = type === "product" ? "product_subscriptions" : "subscriptions";
    let query = admin.from(table).select("*").order("created_at", { ascending: false }).limit(100);

    if (statusFilter) query = query.eq("status", statusFilter);

    const { data: subs } = await query;

    // Get user names for each subscription
    const userIds = [...new Set((subs || []).map((s) => s.user_id))];
    const { data: profiles } = await admin.from("profiles").select("id, name, email").in("id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const enriched = (subs || []).map((s) => ({
      ...s,
      user_name: profileMap.get(s.user_id)?.name || "?",
      user_email: profileMap.get(s.user_id)?.email || "?",
    }));

    return NextResponse.json({ subscriptions: enriched });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
