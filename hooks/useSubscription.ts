"use client";

import { useEffect, useState } from "react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  billing_type: string;
  value: number;
  next_due_date: string | null;
  overdue_since: string | null;
  created_at: string;
  cancelled_at: string | null;
}

interface Payment {
  id: string;
  asaas_payment_id: string;
  status: string;
  billing_type: string;
  value: number;
  due_date: string;
  payment_date: string | null;
  invoice_url: string | null;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  boleto_url: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [latestPayment, setLatestPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setError(null);
      const res = await fetch("/api/billing/subscription");
      const data = await res.json();
      if (res.ok) {
        setSubscription(data.subscription || null);
        setLatestPayment(data.latestPayment || null);
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
  }, []);

  return {
    subscription,
    latestPayment,
    loading,
    error,
    refetch: fetchSubscription,
  };
}
