"use client";

import ProductStatusGate from "@/components/products/ProductStatusGate";
import IaOticaDashboard from "./components/IaOticaDashboard";

export default function IaOticaPage() {
  return (
    <ProductStatusGate product="IA_OTICA">
      <IaOticaDashboard />
    </ProductStatusGate>
  );
}
