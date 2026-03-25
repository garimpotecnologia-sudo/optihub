import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Get most recent subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Get latest payment for this subscription
    const { data: latestPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("subscription_id", subscription.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      subscription,
      latestPayment,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar assinatura" },
      { status: 500 }
    );
  }
}
