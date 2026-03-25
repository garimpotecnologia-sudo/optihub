import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { asaas } from "@/lib/asaas";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { product } = await request.json();
    if (!product || !["IA_OTICA", "IA_AGENDAMENTO"].includes(product)) {
      return NextResponse.json({ error: "Produto inválido" }, { status: 400 });
    }

    const { data: subscription } = await supabase
      .from("product_subscriptions")
      .select("id, asaas_subscription_id, status")
      .eq("user_id", user.id)
      .eq("product", product)
      .in("status", ["ACTIVE", "OVERDUE", "PENDING"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada." }, { status: 404 });
    }

    await asaas.cancelSubscription(subscription.asaas_subscription_id);

    const admin = createAdminSupabase();
    const now = new Date().toISOString();

    await admin.from("product_subscriptions").update({
      status: "CANCELLED",
      cancelled_at: now,
      updated_at: now,
    }).eq("id", subscription.id);

    return NextResponse.json({ cancelled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao cancelar assinatura";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
