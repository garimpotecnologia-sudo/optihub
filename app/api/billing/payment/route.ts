import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { asaas } from "@/lib/asaas";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const paymentId = request.nextUrl.searchParams.get("id");
    if (!paymentId) {
      return NextResponse.json(
        { error: "ID do pagamento é obrigatório" },
        { status: 400 }
      );
    }

    // Get local payment
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("asaas_payment_id", paymentId)
      .eq("user_id", user.id)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // If PIX and still pending, refresh QR code from ASAAS
    if (payment.billing_type === "PIX" && payment.status === "PENDING") {
      try {
        const asaasPayment = await asaas.getPayment(paymentId);
        const admin = createAdminSupabase();

        if (
          asaasPayment.status === "CONFIRMED" ||
          asaasPayment.status === "RECEIVED"
        ) {
          // Payment confirmed but webhook hasn't arrived yet
          await admin
            .from("payments")
            .update({
              status: "CONFIRMED",
              payment_date: asaasPayment.paymentDate || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

          return NextResponse.json({
            ...payment,
            status: "CONFIRMED",
          });
        }

        // Refresh PIX data if not yet available
        if (!payment.pix_qr_code) {
          const pixData = await asaas.getPaymentPixQrCode(paymentId);
          await admin
            .from("payments")
            .update({
              pix_qr_code: pixData.encodedImage,
              pix_copy_paste: pixData.payload,
            })
            .eq("id", payment.id);

          return NextResponse.json({
            ...payment,
            pix_qr_code: pixData.encodedImage,
            pix_copy_paste: pixData.payload,
          });
        }
      } catch {
        // If ASAAS call fails, return local data
      }
    }

    return NextResponse.json(payment);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar pagamento" },
      { status: 500 }
    );
  }
}
