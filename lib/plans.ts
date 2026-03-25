export const PLANS = {
  STARTER: {
    name: "Starter",
    price: 0,
    monthlyLimit: 30,
    features: [
      "30 gerações/mês",
      "Criador de Artes básico",
      "Editor de Produtos (5/mês)",
      "Acesso à comunidade",
      "Templates básicos",
    ],
  },
  PRO: {
    name: "Pro",
    price: 97,
    monthlyLimit: 500,
    features: [
      "500 gerações/mês",
      "Todas as ferramentas",
      "Try-On Virtual ilimitado",
      "Processamento em lote",
      "Assistente de Vendas",
      "Templates premium",
      "Suporte prioritário",
    ],
  },
  REDE: {
    name: "Rede",
    price: 247,
    monthlyLimit: Infinity,
    features: [
      "Gerações ilimitadas",
      "Múltiplos usuários",
      "API customizada",
      "White-label",
      "Dashboard por filial",
      "Gerente de conta",
      "Integração WhatsApp",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLAN_LIMITS: Record<PlanKey, number> = {
  STARTER: 30,
  PRO: 500,
  REDE: Infinity,
};

/** Client-safe version (no Infinity — use 999999 for display) */
export const PLAN_LIMITS_DISPLAY: Record<PlanKey, number> = {
  STARTER: 30,
  PRO: 500,
  REDE: 999999,
};

export function canGenerate(plan: PlanKey, usedThisMonth: number): boolean {
  return usedThisMonth < PLAN_LIMITS[plan];
}
