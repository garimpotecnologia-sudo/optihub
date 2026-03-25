"use client";

import { useState } from "react";
import type { ProductKey } from "@/lib/products";
import { PRODUCTS } from "@/lib/products";

interface ProductCheckoutProps {
  product: ProductKey;
  onSuccess: () => void;
  onBack: () => void;
}

type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

const billingOptions: { value: BillingType; label: string; desc: string }[] = [
  { value: "PIX", label: "PIX", desc: "Aprovação instantânea" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito", desc: "Pagamento recorrente" },
  { value: "BOLETO", label: "Boleto", desc: "Até 3 dias úteis" },
];

export default function ProductCheckout({ product, onSuccess, onBack }: ProductCheckoutProps) {
  const p = PRODUCTS[product];
  const [step, setStep] = useState<"method" | "cpf" | "processing" | "waiting" | "done">("method");
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<{
    pix?: { qrCode: string; copyPaste: string; expirationDate: string };
    boletoUrl?: string;
    invoiceUrl?: string;
    subscriptionId?: string;
    paymentId?: string;
    status?: string;
  } | null>(null);

  const formatCpfCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, d) =>
        d ? `${a}.${b}.${c}-${d}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
      );
    }
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, a, b, c, d, e) =>
      e ? `${a}.${b}.${c}/${d}-${e}` : d ? `${a}.${b}.${c}/${d}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
    );
  };

  const handleCheckout = async () => {
    if (cpfCnpj.replace(/\D/g, "").length < 11) {
      setError("CPF/CNPJ inválido");
      return;
    }
    setStep("processing");
    setError("");

    try {
      const res = await fetch("/api/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, billingType, cpfCnpj }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        setError((data.error as string) || "Erro ao processar");
        setStep("cpf");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPaymentData(data as any);
      if (billingType === "CREDIT_CARD" && data.invoiceUrl) {
        window.open(data.invoiceUrl as string, "_blank");
      }
      setStep("waiting");

      // Poll for payment confirmation
      if (data.paymentId) {
        const interval = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/products/subscription?product=${product}`);
            const pollData = await pollRes.json();
            if (pollData.subscription?.status === "ACTIVE") {
              clearInterval(interval);
              setStep("done");
              setTimeout(onSuccess, 1500);
            }
          } catch { /* continue polling */ }
        }, 5000);
        setTimeout(() => clearInterval(interval), 600000);
      }
    } catch {
      setError("Erro de conexão");
      setStep("cpf");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="card-featured rounded-2xl p-6 space-y-1">
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Contratar {p.name}</h2>
        <p className="text-sm text-text-muted">R$ {p.price}/mês</p>
      </div>

      {step === "method" && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-text-secondary">Forma de pagamento</p>
          <div className="space-y-2">
            {billingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBillingType(opt.value)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  billingType === opt.value
                    ? "border-accent-green/30 bg-accent-green/5"
                    : "border-border bg-bg-card hover:border-border-hover"
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-text-muted">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  billingType === opt.value ? "border-accent-green" : "border-text-muted"
                }`}>
                  {billingType === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("cpf")}
            className="btn-press btn-primary w-full py-3.5 rounded-xl text-bg-deep font-bold text-sm"
          >
            Continuar
          </button>
        </div>
      )}

      {step === "cpf" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">CPF ou CNPJ</label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={18}
              className="input-glow w-full px-4 py-3 rounded-xl bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none text-sm"
            />
            {error && <p className="text-xs text-accent-rose mt-2">{error}</p>}
          </div>
          <button
            onClick={handleCheckout}
            className="btn-press btn-primary w-full py-3.5 rounded-xl text-bg-deep font-bold text-sm"
          >
            Confirmar e Pagar
          </button>
        </div>
      )}

      {step === "processing" && (
        <div className="card-base rounded-2xl p-10 flex flex-col items-center gap-4">
          <svg className="w-8 h-8 animate-spin text-accent-green" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-text-secondary">Processando pagamento...</p>
        </div>
      )}

      {step === "waiting" && paymentData && (
        <div className="card-base rounded-2xl p-6 space-y-4">
          {billingType === "PIX" && paymentData.pix?.copyPaste && (
            <>
              <p className="text-sm font-medium text-text-secondary">Copie o código PIX:</p>
              <div className="relative">
                <input
                  readOnly
                  value={paymentData.pix.copyPaste}
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-bg-deep border border-border text-xs font-mono text-text-muted"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(paymentData.pix!.copyPaste)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium hover:bg-accent-green/20 transition-colors"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-text-muted text-center">Aguardando confirmação do pagamento...</p>
            </>
          )}
          {billingType === "BOLETO" && paymentData.boletoUrl && (
            <a href={paymentData.boletoUrl} target="_blank" rel="noopener noreferrer"
              className="btn-press btn-primary block w-full py-3.5 rounded-xl text-bg-deep font-bold text-sm text-center">
              Abrir Boleto
            </a>
          )}
          {billingType === "CREDIT_CARD" && (
            <p className="text-sm text-text-muted text-center">Complete o pagamento na janela aberta. Aguardando confirmação...</p>
          )}
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin text-accent-green" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-xs text-text-muted">Verificando pagamento...</span>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="card-base rounded-2xl p-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-accent-green">Pagamento confirmado!</p>
          <p className="text-xs text-text-muted">Redirecionando para o painel...</p>
        </div>
      )}
    </div>
  );
}
