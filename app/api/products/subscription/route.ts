import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const product = request.nextUrl.searchParams.get("product");
    if (!product || !["IA_OTICA", "IA_AGENDAMENTO"].includes(product)) {
      return NextResponse.json({ error: "Produto inválido" }, { status: 400 });
    }

    const { data: subscription } = await supabase
      .from("product_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("product", product)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ subscription: subscription || null });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar assinatura" }, { status: 500 });
  }
}
