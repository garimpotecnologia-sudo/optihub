"use client";

import ProductStatusGate from "@/components/products/ProductStatusGate";
import IaAgendamentoDashboard from "./components/IaAgendamentoDashboard";

export default function IaAgendamentoPage() {
  return (
    <ProductStatusGate product="IA_AGENDAMENTO">
      <IaAgendamentoDashboard />
    </ProductStatusGate>
  );
}
