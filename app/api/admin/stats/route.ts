import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const admin = createAdminSupabase();

    // Total users
    const { count: totalUsers } = await admin.from("profiles").select("*", { count: "exact", head: true });

    // Users by plan
    const { count: starter } = await admin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "STARTER");
    const { count: pro } = await admin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "PRO");
    const { count: rede } = await admin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "REDE");
    const byPlan = { STARTER: starter || 0, PRO: pro || 0, REDE: rede || 0 };

    // Generations this month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: monthlyGenerations } = await admin.from("generations").select("*", { count: "exact", head: true }).gte("created_at", monthStart);

    // Active subscriptions (main plan)
    const { count: activeMainSubs } = await admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");

    // Active product subscriptions
    const { count: activeProductSubs } = await admin.from("product_subscriptions").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");

    // Revenue from active subs
    const { data: activeSubs } = await admin.from("subscriptions").select("value").eq("status", "ACTIVE");
    const { data: activeProds } = await admin.from("product_subscriptions").select("value").eq("status", "ACTIVE");
    const mainRevenue = (activeSubs || []).reduce((sum, s) => sum + Number(s.value), 0);
    const prodRevenue = (activeProds || []).reduce((sum, s) => sum + Number(s.value), 0);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      byPlan,
      monthlyGenerations: monthlyGenerations || 0,
      activeMainSubs: activeMainSubs || 0,
      activeProductSubs: activeProductSubs || 0,
      revenue: { main: mainRevenue, products: prodRevenue, total: mainRevenue + prodRevenue },
    });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
