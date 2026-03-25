"use client";

import { useEffect, useState } from "react";
import type { ProductKey } from "@/lib/products";

interface ProductSubscription {
  id: string;
  product: string;
  status: string;
  billing_type: string;
  value: number;
  next_due_date: string | null;
  overdue_since: string | null;
  created_at: string;
  cancelled_at: string | null;
}

export function useProductSubscription(product: ProductKey) {
  const [subscription, setSubscription] = useState<ProductSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/products/subscription?product=${product}`);
      const data = await res.json();
      if (res.ok) {
        setSubscription(data.subscription || null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Erro ao carregar assinatura");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const isActive = subscription?.status === "ACTIVE" || subscription?.status === "OVERDUE";

  return { subscription, loading, error, isActive, refetch: fetchSubscription };
}
