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
    const search = request.nextUrl.searchParams.get("search") || "";
    const planFilter = request.nextUrl.searchParams.get("plan") || "";
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    let query = admin.from("profiles").select("id, name, email, plan, role, credits, subscription_status, created_at", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (planFilter) {
      query = query.eq("plan", planFilter);
    }

    const { data: users, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    return NextResponse.json({ users: users || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
