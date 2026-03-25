export const PRODUCTS = {
  IA_OTICA: {
    id: "IA_OTICA" as const,
    name: "IA para Ótica",
    slug: "ia-otica",
    price: 297,
    description: "IA conversacional para atendimento ao cliente da sua ótica",
    features: [
      "Atendimento automático 24/7",
      "Geração de orçamentos automática",
      "Transbordo inteligente para humano",
      "Sequências de follow-up automatizadas",
      "Dashboard de analytics em tempo real",
    ],
  },
  IA_AGENDAMENTO: {
    id: "IA_AGENDAMENTO" as const,
    name: "IA para Agendamento",
    slug: "ia-agendamento",
    price: 197,
    description: "IA para gerenciar agendamentos da sua ótica",
    features: [
      "Agendamento automático via WhatsApp",
      "Calendário visual de compromissos",
      "Configuração de disponibilidade",
      "Confirmação automática",
      "Gestão de cancelamentos",
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
