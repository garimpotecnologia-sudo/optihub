"use client";

import { useState } from "react";
import { useProductSubscription } from "@/hooks/useProductSubscription";
import type { ProductKey } from "@/lib/products";
import ProductLanding from "./ProductLanding";
import ProductCheckout from "./ProductCheckout";

interface ProductStatusGateProps {
  product: ProductKey;
  children: React.ReactNode;
}

export default function ProductStatusGate({ product, children }: ProductStatusGateProps) {
  const { isActive, loading, refetch } = useProductSubscription(product);
  const [showCheckout, setShowCheckout] = useState(false);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-bg-card-hover" />
        <div className="h-64 rounded-2xl bg-bg-card" />
      </div>
    );
  }

  if (isActive) {
    return <>{children}</>;
  }

  if (showCheckout) {
    return (
      <ProductCheckout
        product={product}
        onSuccess={() => refetch()}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return <ProductLanding product={product} onSubscribe={() => setShowCheckout(true)} />;
}
