"use client";

import { useState, useEffect, useCallback } from "react";

interface PixPaymentProps {
  paymentId: string;
  qrCode: string;
  copyPaste: string;
  onConfirmed: () => void;
}

export default function PixPayment({
  paymentId,
  qrCode,
  copyPaste,
  onConfirmed,
}: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/billing/payment?id=${paymentId}`);
      const data = await res.json();
      if (data.status === "CONFIRMED" || data.status === "RECEIVED") {
        setChecking(false);
        onConfirmed();
      }
    } catch {
      // Silently retry
    }
  }, [paymentId, onConfirmed]);

  useEffect(() => {
    if (!checking) return;
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [checking, checkPaymentStatus]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-bold font-[var(--font-heading)]">
          Escaneie o QR Code
        </h3>
        <p className="text-sm text-text-muted">
          Abra o app do seu banco e escaneie o código abaixo
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-[16px] inline-block">
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code PIX"
            className="w-48 h-48"
          />
        </div>
      </div>

      {/* Copy & Paste */}
      <div className="space-y-2">
        <p className="text-xs text-text-muted">Ou copie o código PIX:</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={copyPaste}
            className="flex-1 px-3 py-2.5 rounded-[10px] bg-bg-deep border border-border text-text-primary text-xs font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-[10px] bg-accent-green/10 text-accent-green text-sm font-medium hover:bg-accent-green/20 transition-colors whitespace-nowrap"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Status */}
      {checking && (
        <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
          <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
          Aguardando pagamento...
        </div>
      )}
    </div>
  );
}
