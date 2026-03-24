"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

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
  monthlyUsage?: number;
}

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 30,
  PRO: 500,
  REDE: 999999,
};

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
        // Get monthly usage
        const { data: usage } = await supabase.rpc("get_monthly_usage", {
          p_user_id: user.id,
        });
        setProfile({ ...data, monthlyUsage: usage || 0 });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const planLimit = profile ? PLAN_LIMITS[profile.plan] || 30 : 30;

  return { profile, loading, planLimit, supabase };
}
