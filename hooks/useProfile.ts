"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PLAN_LIMITS_DISPLAY } from "@/lib/plans";

interface Profile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  optica_name: string | null;
  optica_logo: string | null;
  optica_address: string | null;
  optica_brands: string[];
  plan: "STARTER" | "PRO" | "REDE";
  credits: number;
  custom_api_key: string | null;
  subscription_status?: string | null;
  monthlyUsage?: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        const { data: usage } = await supabase.rpc("get_monthly_usage", {
          p_user_id: user.id,
        });
        setProfile({ ...data, monthlyUsage: usage || 0 });
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planLimit = profile ? PLAN_LIMITS_DISPLAY[profile.plan] || 30 : 30;

  return { profile, loading, planLimit, supabase };
}
