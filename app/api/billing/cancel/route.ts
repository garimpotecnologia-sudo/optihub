import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { asaas } from "@/lib/asaas";

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Find active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, asaas_subscription_id, status")
      .eq("user_id", user.id)
      .in("status", ["ACTIVE", "OVERDUE", "PENDING"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada." },
        { status: 404 }
      );
    }

    // Cancel on ASAAS
    await asaas.cancelSubscription(subscription.asaas_subscription_id);

    // Update locally
    const admin = createAdminSupabase();
    const now = new Date().toISOString();

    await admin
      .from("subscriptions")
      .update({
        status: "CANCELLED",
        cancelled_at: now,
        updated_at: now,
      })
      .eq("id", subscription.id);

    // Downgrade plan
    await admin
      .from("profiles")
      .update({
        plan: "STARTER",
        subscription_status: null,
      })
      .eq("id", user.id);

    return NextResponse.json({ cancelled: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao cancelar assinatura";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
