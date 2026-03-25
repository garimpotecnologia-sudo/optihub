"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import StatusBadge from "@/components/billing/StatusBadge";

interface PaymentRecord {
  id: string;
  asaas_payment_id: string;
  status: string;
  billing_type: string;
  value: number;
  due_date: string;
  payment_date: string | null;
  invoice_url: string | null;
  created_at: string;
}

export default function BillingPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const { subscription, loading: subLoading } = useSubscription();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch("/api/billing/history");
        const data = await res.json();
        setPayments(data.payments || []);
      } catch {
        // silently fail
      } finally {
        setLoadingPayments(false);
      }
    }
    loadPayments();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (res.ok) {
        setShowCancelModal(false);
        router.refresh();
        window.location.reload();
      }
    } catch {
      // silently fail
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const formatBillingType = (type: string) => {
    const map: Record<string, string> = {
      PIX: "PIX",
      BOLETO: "Boleto",
      CREDIT_CARD: "Cartão",
    };
    return map[type] || type;
  };

  if (subLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-[16px] bg-bg-card" />
        ))}
      </div>
    );
  }

  // No subscription — show upgrade prompt
  if (!subscription || subscription.status === "CANCELLED" || subscription.status === "EXPIRED") {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Assinatura
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie seu plano e pagamentos.
          </p>
        </div>

        <div className="rounded-[16px] border border-border bg-bg-card p-8 text-center space-y-4">
          <h2 className="text-lg font-bold font-[var(--font-heading)]">
            Você está no plano Starter
          </h2>
          <p className="text-text-muted text-sm">
            Faça upgrade para o plano Pro e desbloqueie 500 gerações por mês.
          </p>
          <button
            onClick={() => router.push("/dashboard/upgrade")}
            className="px-6 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.2)] transition-all"
          >
            Upgrade para Pro — R$97/mês
          </button>
        </div>

        {/* Show history even if cancelled */}
        {payments.length > 0 && (
          <PaymentHistory
            payments={payments}
            loading={loadingPayments}
            formatDate={formatDate}
            formatBillingType={formatBillingType}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Assinatura
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Gerencie seu plano e pagamentos.
        </p>
      </div>

      {/* Subscription Details */}
      <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-[var(--font-heading)]">
            Plano Atual
          </h2>
          <StatusBadge status={subscription.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-muted">Plano</p>
            <p className="text-sm font-medium mt-0.5">{subscription.plan}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Valor</p>
            <p className="text-sm font-medium mt-0.5">
              R${Number(subscription.value).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Pagamento</p>
            <p className="text-sm font-medium mt-0.5">
              {formatBillingType(subscription.billing_type)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Próximo vencimento</p>
            <p className="text-sm font-medium mt-0.5">
              {subscription.next_due_date
                ? formatDate(subscription.next_due_date)
                : "—"}
            </p>
          </div>
        </div>

        {subscription.status === "OVERDUE" && (
          <div className="p-3 rounded-[10px] bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">
            Seu pagamento está em atraso. Regularize para manter o acesso ao
            plano Pro.
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-sm text-text-muted hover:text-accent-rose transition-colors"
          >
            Cancelar assinatura
          </button>
        </div>
      </div>

      {/* Payment History */}
      <PaymentHistory
        payments={payments}
        loading={loadingPayments}
        formatDate={formatDate}
        formatBillingType={formatBillingType}
      />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative rounded-[16px] border border-border bg-bg-card p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold font-[var(--font-heading)]">
              Cancelar assinatura?
            </h3>
            <p className="text-sm text-text-muted">
              Ao cancelar, você perderá acesso às funcionalidades do plano Pro e
              voltará para o plano Starter com 30 gerações/mês.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-[10px] border border-border text-sm font-medium hover:border-border-hover transition-colors"
              >
                Manter plano
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-[10px] bg-accent-rose/10 text-accent-rose text-sm font-medium hover:bg-accent-rose/20 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentHistory({
  payments,
  loading,
  formatDate,
  formatBillingType,
}: {
  payments: PaymentRecord[];
  loading: boolean;
  formatDate: (d: string) => string;
  formatBillingType: (t: string) => string;
}) {
  if (loading) {
    return (
      <div className="rounded-[16px] border border-border bg-bg-card p-6">
        <div className="h-32 animate-pulse bg-bg-deep rounded-[10px]" />
      </div>
    );
  }

  if (payments.length === 0) return null;

  return (
    <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-4">
      <h2 className="text-lg font-bold font-[var(--font-heading)]">
        Histórico de Pagamentos
      </h2>

      <div className="space-y-2">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 rounded-[10px] bg-bg-deep border border-border"
          >
            <div className="flex items-center gap-3">
              <StatusBadge status={p.status} />
              <div>
                <p className="text-sm font-medium">
                  R${Number(p.value).toFixed(2)}
                </p>
                <p className="text-xs text-text-muted">
                  {formatBillingType(p.billing_type)} — Vencimento:{" "}
                  {formatDate(p.due_date)}
                </p>
              </div>
            </div>
            {p.invoice_url && (
              <a
                href={p.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-green hover:underline"
              >
                Ver fatura
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
