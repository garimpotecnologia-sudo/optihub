import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { asaas } from "@/lib/asaas";
import { PRODUCTS } from "@/lib/products";
import { z } from "zod";

const checkoutSchema = z.object({
  product: z.enum(["IA_OTICA", "IA_AGENDAMENTO"]),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
  cpfCnpj: z.string().min(11).max(18).transform((v) => v.replace(/\D/g, "")),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { product, billingType, cpfCnpj } = parsed.data;
    const productConfig = PRODUCTS[product];

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, asaas_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Check existing active subscription for this product
    const { data: existingSub } = await supabase
      .from("product_subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("product", product)
      .in("status", ["ACTIVE", "PENDING"])
      .limit(1)
      .single();

    if (existingSub) {
      return NextResponse.json({ error: "Você já possui este produto ativo." }, { status: 409 });
    }

    const admin = createAdminSupabase();

    // Create or get ASAAS customer
    let asaasCustomerId = profile.asaas_customer_id;
    if (!asaasCustomerId) {
      const customer = await asaas.createCustomer({
        name: profile.name,
        email: profile.email,
        cpfCnpj,
      });
      asaasCustomerId = customer.id;
      await admin.from("profiles").update({ asaas_customer_id: asaasCustomerId }).eq("id", user.id);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDueDate = tomorrow.toISOString().split("T")[0];

    const subscription = await asaas.createSubscription({
      customer: asaasCustomerId,
      billingType,
      value: productConfig.price,
      nextDueDate,
      cycle: "MONTHLY",
      description: `ÓptiHub - ${productConfig.name}`,
    });

    await admin.from("product_subscriptions").insert({
      user_id: user.id,
      product,
      asaas_customer_id: asaasCustomerId,
      asaas_subscription_id: subscription.id,
      status: "PENDING",
      billing_type: billingType,
      value: productConfig.price,
      next_due_date: nextDueDate,
    });

    // Get first payment
    const payments = await asaas.listSubscriptionPayments(subscription.id);
    const firstPayment = payments.data[0];

    if (!firstPayment) {
      return NextResponse.json({
        subscriptionId: subscription.id,
        status: "PENDING",
        message: "Assinatura criada. Aguardando geração do pagamento.",
      });
    }

    const subRecord = await admin
      .from("product_subscriptions")
      .select("id")
      .eq("asaas_subscription_id", subscription.id)
      .single();

    await admin.from("product_payments").insert({
      user_id: user.id,
      product_subscription_id: subRecord.data?.id,
      asaas_payment_id: firstPayment.id,
      status: "PENDING",
      billing_type: billingType,
      value: firstPayment.value,
      due_date: firstPayment.dueDate,
      invoice_url: firstPayment.invoiceUrl || null,
      boleto_url: firstPayment.bankSlipUrl || null,
    });

    const response: Record<string, unknown> = {
      subscriptionId: subscription.id,
      paymentId: firstPayment.id,
      status: "PENDING",
      invoiceUrl: firstPayment.invoiceUrl,
    };

    if (billingType === "PIX") {
      const pixData = await asaas.getPaymentPixQrCode(firstPayment.id);
      response.pix = {
        qrCode: pixData.encodedImage,
        copyPaste: pixData.payload,
        expirationDate: pixData.expirationDate,
      };
      await admin.from("product_payments").update({
        pix_qr_code: pixData.encodedImage,
        pix_copy_paste: pixData.payload,
      }).eq("asaas_payment_id", firstPayment.id);
    } else if (billingType === "BOLETO") {
      response.boletoUrl = firstPayment.bankSlipUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar assinatura";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
