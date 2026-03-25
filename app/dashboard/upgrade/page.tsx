"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { PLANS } from "@/lib/plans";
import PaymentMethodSelector from "@/components/billing/PaymentMethodSelector";
import PixPayment from "@/components/billing/PixPayment";

type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";
type Step = "plan" | "payment" | "cpf" | "processing" | "waiting" | "success";

export default function UpgradePage() {
  const router = useRouter();
  const { profile } = useProfile();

  const [step, setStep] = useState<Step>("plan");
  const [billingType, setBillingType] = useState<BillingType | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Checkout response data
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    copyPaste: string;
  } | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  if (profile?.plan === "PRO" || profile?.plan === "REDE") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-4">
          Você já é {profile.plan}!
        </h1>
        <p className="text-text-secondary mb-6">
          Gerencie sua assinatura na página de billing.
        </p>
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="px-6 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm"
        >
          Gerenciar Assinatura
        </button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!billingType || !cpfCnpj.replace(/\D/g, "")) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");
    setStep("processing");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingType, cpfCnpj }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar assinatura");
        setStep("cpf");
        setLoading(false);
        return;
      }

      if (billingType === "PIX" && data.pix) {
        setPixData({
          paymentId: data.paymentId,
          qrCode: data.pix.qrCode,
          copyPaste: data.pix.copyPaste,
        });
        setStep("waiting");
      } else if (billingType === "BOLETO") {
        setBoletoUrl(data.boletoUrl || data.invoiceUrl);
        setStep("waiting");
      } else if (billingType === "CREDIT_CARD") {
        setInvoiceUrl(data.invoiceUrl);
        // Redirect to ASAAS hosted checkout
        if (data.invoiceUrl) {
          window.open(data.invoiceUrl, "_blank");
        }
        setStep("waiting");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setStep("cpf");
    } finally {
      setLoading(false);
    }
  };

  const formatCpfCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Upgrade para Pro
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Desbloqueie todo o potencial do ÓptiHub
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-[10px] bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Plan presentation */}
      {step === "plan" && (
        <div className="space-y-6">
          <div className="rounded-[16px] border border-accent-green/20 bg-bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  Plano Pro
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Para óticas que querem crescer
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-[800] font-[var(--font-heading)]">
                  R${PLANS.PRO.price}
                </span>
                <span className="text-text-muted text-sm">/mês</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANS.PRO.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <svg
                    className="w-4 h-4 text-accent-green flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Seu plano atual:</span>
              <span className="font-medium">
                Starter — {PLANS.STARTER.monthlyLimit} gerações/mês
              </span>
            </div>
          </div>

          <button
            onClick={() => setStep("payment")}
            className="w-full py-3.5 rounded-[12px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.2)] transition-all"
          >
            Assinar Pro — R${PLANS.PRO.price}/mês
          </button>

          <p className="text-center text-xs text-text-muted">
            Precisa de mais?{" "}
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-violet hover:underline"
            >
              Conheça o plano Rede
            </a>
          </p>
        </div>
      )}

      {/* Step 2: Payment method */}
      {step === "payment" && (
        <div className="space-y-6">
          <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
            <h2 className="text-lg font-bold font-[var(--font-heading)]">
              Método de Pagamento
            </h2>
            <PaymentMethodSelector
              value={billingType}
              onChange={(method) => {
                setBillingType(method);
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("plan")}
              className="px-6 py-3 rounded-[10px] border border-border text-text-secondary text-sm font-medium hover:border-border-hover transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={() => billingType && setStep("cpf")}
              disabled={!billingType}
              className="flex-1 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-50 transition-all"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: CPF/CNPJ */}
      {step === "cpf" && (
        <div className="space-y-6">
          <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-5">
            <h2 className="text-lg font-bold font-[var(--font-heading)]">
              Dados do Pagador
            </h2>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) =>
                  setCpfCnpj(formatCpfCnpj(e.target.value))
                }
                maxLength={18}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm"
              />
              <p className="text-xs text-text-muted mt-1.5">
                Necessário para emissão da cobrança
              </p>
            </div>

            <div className="p-3 rounded-[10px] bg-bg-deep border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Plano</span>
                <span className="font-medium">Pro</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-text-muted">Pagamento</span>
                <span className="font-medium">
                  {billingType === "PIX"
                    ? "PIX"
                    : billingType === "BOLETO"
                    ? "Boleto"
                    : "Cartão de Crédito"}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-text-muted">Valor</span>
                <span className="font-bold text-accent-green">
                  R${PLANS.PRO.price}/mês
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("payment")}
              className="px-6 py-3 rounded-[10px] border border-border text-text-secondary text-sm font-medium hover:border-border-hover transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading || cpfCnpj.replace(/\D/g, "").length < 11}
              className="flex-1 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm disabled:opacity-50 transition-all"
            >
              {loading ? "Processando..." : "Confirmar Assinatura"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Processing */}
      {step === "processing" && (
        <div className="text-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary">Criando sua assinatura...</p>
        </div>
      )}

      {/* Step 5: Waiting for payment */}
      {step === "waiting" && (
        <div className="space-y-6">
          {billingType === "PIX" && pixData && (
            <div className="rounded-[16px] border border-border bg-bg-card p-6">
              <PixPayment
                paymentId={pixData.paymentId}
                qrCode={pixData.qrCode}
                copyPaste={pixData.copyPaste}
                onConfirmed={() => setStep("success")}
              />
            </div>
          )}

          {billingType === "BOLETO" && (
            <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-4 text-center">
              <h3 className="text-lg font-bold font-[var(--font-heading)]">
                Boleto Gerado!
              </h3>
              <p className="text-sm text-text-muted">
                Seu boleto foi gerado. O pagamento pode levar até 3 dias úteis
                para ser confirmado.
              </p>
              {boletoUrl && (
                <a
                  href={boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm"
                >
                  Visualizar Boleto
                </a>
              )}
              <p className="text-xs text-text-muted">
                Seu plano será ativado automaticamente após a confirmação do
                pagamento.
              </p>
            </div>
          )}

          {billingType === "CREDIT_CARD" && (
            <div className="rounded-[16px] border border-border bg-bg-card p-6 space-y-4 text-center">
              <h3 className="text-lg font-bold font-[var(--font-heading)]">
                Complete o pagamento
              </h3>
              <p className="text-sm text-text-muted">
                Uma janela foi aberta para você completar o pagamento com cartão
                de crédito.
              </p>
              {invoiceUrl && (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm"
                >
                  Abrir Página de Pagamento
                </a>
              )}
              <p className="text-xs text-text-muted">
                Após o pagamento, seu plano será ativado automaticamente.
              </p>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-[10px] border border-border text-text-secondary text-sm font-medium hover:border-border-hover transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      )}

      {/* Step 6: Success */}
      {step === "success" && (
        <div className="text-center py-16 space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-accent-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-[var(--font-heading)]">
              Pagamento Confirmado!
            </h2>
            <p className="text-text-secondary mt-2">
              Seu plano Pro já está ativo. Aproveite 500 gerações por mês!
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm"
          >
            Ir para o Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
