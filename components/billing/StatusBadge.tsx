"use client";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Ativo",
    className: "bg-accent-green/10 text-accent-green border-accent-green/20",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  },
  OVERDUE: {
    label: "Em atraso",
    className: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-text-muted/10 text-text-muted border-text-muted/20",
  },
  EXPIRED: {
    label: "Expirado",
    className: "bg-text-muted/10 text-text-muted border-text-muted/20",
  },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-accent-green/10 text-accent-green border-accent-green/20",
  },
  RECEIVED: {
    label: "Recebido",
    className: "bg-accent-green/10 text-accent-green border-accent-green/20",
  },
  REFUNDED: {
    label: "Reembolsado",
    className: "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
  },
  DELETED: {
    label: "Removido",
    className: "bg-text-muted/10 text-text-muted border-text-muted/20",
  },
  FAILED: {
    label: "Falhou",
    className: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
  },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-text-muted/10 text-text-muted border-text-muted/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
