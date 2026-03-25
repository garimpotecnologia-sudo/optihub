"use client";

const methods = [
  {
    id: "PIX" as const,
    label: "PIX",
    description: "Aprovação instantânea",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
      </svg>
    ),
  },
  {
    id: "BOLETO" as const,
    label: "Boleto Bancário",
    description: "Até 3 dias úteis",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zm9.75-9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625v5.25M16.5 14.625v5.25M19.5 14.625v5.25" />
      </svg>
    ),
  },
  {
    id: "CREDIT_CARD" as const,
    label: "Cartão de Crédito",
    description: "Aprovação instantânea",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

interface PaymentMethodSelectorProps {
  value: "PIX" | "BOLETO" | "CREDIT_CARD" | null;
  onChange: (method: "PIX" | "BOLETO" | "CREDIT_CARD") => void;
}

export default function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onChange(method.id)}
          className={`w-full flex items-center gap-4 p-4 rounded-[12px] border transition-all text-left ${
            value === method.id
              ? "border-accent-green/50 bg-accent-green/5 shadow-[0_0_20px_rgba(3,255,148,0.05)]"
              : "border-border bg-bg-deep hover:border-border-hover"
          }`}
        >
          <div
            className={`${
              value === method.id ? "text-accent-green" : "text-text-muted"
            }`}
          >
            {method.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{method.label}</p>
            <p className="text-xs text-text-muted">{method.description}</p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === method.id
                ? "border-accent-green"
                : "border-text-muted/30"
            }`}
          >
            {value === method.id && (
              <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
