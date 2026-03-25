import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

const GRACE_PERIOD_DAYS = 3;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token
    const token = request.headers.get("asaas-access-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    if (!event) {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const admin = createAdminSupabase();

    // Idempotency: check if event was already processed
    const eventId = `${event}_${payment?.id || body.id || Date.now()}`;
    const { data: existingEvent } = await admin
      .from("webhook_events")
      .select("id, processed")
      .eq("asaas_event_id", eventId)
      .single();

    if (existingEvent?.processed) {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // Log event
    const { data: webhookEvent } = await admin
      .from("webhook_events")
      .upsert(
        {
          event_type: event,
          asaas_event_id: eventId,
          payload: body,
          processed: false,
        },
        { onConflict: "asaas_event_id" }
      )
      .select("id")
      .single();

    // Process event
    try {
      switch (event) {
        case "PAYMENT_CREATED": {
          if (!payment?.subscription) break;
          await handlePaymentCreated(admin, payment);
          break;
        }

        case "PAYMENT_CONFIRMED":
        case "PAYMENT_RECEIVED": {
          if (!payment?.subscription) break;
          await handlePaymentConfirmed(admin, payment);
          break;
        }

        case "PAYMENT_OVERDUE": {
          if (!payment?.subscription) break;
          await handlePaymentOverdue(admin, payment);
          break;
        }

        case "PAYMENT_DELETED":
        case "PAYMENT_REFUNDED": {
          if (!payment?.subscription) break;
          await handlePaymentFailed(admin, payment, event);
          break;
        }

        case "SUBSCRIPTION_DELETED":
        case "SUBSCRIPTION_EXPIRED": {
          const subscriptionId = body.subscription?.id || body.id;
          if (subscriptionId) {
            await handleSubscriptionCancelled(admin, subscriptionId);
          }
          break;
        }
      }

      // Mark as processed
      if (webhookEvent?.id) {
        await admin
          .from("webhook_events")
          .update({ processed: true })
          .eq("id", webhookEvent.id);
      }
    } catch (processError) {
      // Log error but still return 200 to avoid ASAAS retries
      const errorMsg =
        processError instanceof Error
          ? processError.message
          : "Unknown processing error";

      if (webhookEvent?.id) {
        await admin
          .from("webhook_events")
          .update({ error: errorMsg })
          .eq("id", webhookEvent.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Always return 200 to ASAAS
    return NextResponse.json({ ok: true });
  }
}

// --- Event Handlers ---

async function handlePaymentCreated(
  admin: ReturnType<typeof createAdminSupabase>,
  payment: Record<string, unknown>
) {
  const subscriptionId = payment.subscription as string;

  // Find our subscription
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, user_id")
    .eq("asaas_subscription_id", subscriptionId)
    .single();

  if (!sub) return;

  // Upsert payment
  await admin.from("payments").upsert(
    {
      user_id: sub.user_id,
      subscription_id: sub.id,
      asaas_payment_id: payment.id as string,
      status: "PENDING",
      billing_type: payment.billingType as string,
      value: payment.value as number,
      due_date: payment.dueDate as string,
      invoice_url: (payment.invoiceUrl as string) || null,
      boleto_url: (payment.bankSlipUrl as string) || null,
    },
    { onConflict: "asaas_payment_id" }
  );
}

async function handlePaymentConfirmed(
  admin: ReturnType<typeof createAdminSupabase>,
  payment: Record<string, unknown>
) {
  const subscriptionId = payment.subscription as string;

  // Update payment
  await admin
    .from("payments")
    .update({
      status: "CONFIRMED",
      payment_date: (payment.paymentDate as string) || new Date().toISOString().split("T")[0],
      net_value: (payment.netValue as number) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("asaas_payment_id", payment.id as string);

  // Find subscription
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, user_id, plan")
    .eq("asaas_subscription_id", subscriptionId)
    .single();

  if (!sub) return;

  // Activate subscription
  await admin
    .from("subscriptions")
    .update({
      status: "ACTIVE",
      overdue_since: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  // Upgrade user plan
  await admin
    .from("profiles")
    .update({
      plan: sub.plan,
      subscription_status: "ACTIVE",
    })
    .eq("id", sub.user_id);
}

async function handlePaymentOverdue(
  admin: ReturnType<typeof createAdminSupabase>,
  payment: Record<string, unknown>
) {
  const subscriptionId = payment.subscription as string;

  // Update payment
  await admin
    .from("payments")
    .update({
      status: "OVERDUE",
      updated_at: new Date().toISOString(),
    })
    .eq("asaas_payment_id", payment.id as string);

  // Find subscription
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, user_id, overdue_since")
    .eq("asaas_subscription_id", subscriptionId)
    .single();

  if (!sub) return;

  const now = new Date();

  // Set overdue_since if not already set
  if (!sub.overdue_since) {
    await admin
      .from("subscriptions")
      .update({
        status: "OVERDUE",
        overdue_since: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", sub.id);

    await admin
      .from("profiles")
      .update({ subscription_status: "OVERDUE" })
      .eq("id", sub.user_id);
  }

  // Check grace period
  if (sub.overdue_since) {
    const overdueSince = new Date(sub.overdue_since);
    const daysSinceOverdue =
      (now.getTime() - overdueSince.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceOverdue >= GRACE_PERIOD_DAYS) {
      // Grace period expired — downgrade
      await admin
        .from("subscriptions")
        .update({
          status: "CANCELLED",
          cancelled_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", sub.id);

      await admin
        .from("profiles")
        .update({
          plan: "STARTER",
          subscription_status: null,
        })
        .eq("id", sub.user_id);
    }
  }
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createAdminSupabase>,
  payment: Record<string, unknown>,
  event: string
) {
  const status = event === "PAYMENT_REFUNDED" ? "REFUNDED" : "DELETED";

  await admin
    .from("payments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("asaas_payment_id", payment.id as string);
}

async function handleSubscriptionCancelled(
  admin: ReturnType<typeof createAdminSupabase>,
  asaasSubscriptionId: string
) {
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, user_id")
    .eq("asaas_subscription_id", asaasSubscriptionId)
    .single();

  if (!sub) return;

  await admin
    .from("subscriptions")
    .update({
      status: "CANCELLED",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  await admin
    .from("profiles")
    .update({
      plan: "STARTER",
      subscription_status: null,
    })
    .eq("id", sub.user_id);
}
