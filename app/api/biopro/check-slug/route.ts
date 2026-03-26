import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ available: false });

  const reserved = ["login", "register", "dashboard", "admin", "api", "linktree"];
  if (reserved.includes(slug)) return NextResponse.json({ available: false, reason: "reservado" });

  const admin = createAdminSupabase();
  const { data } = await admin.from("linktrees").select("id").eq("slug", slug).single();

  return NextResponse.json({ available: !data });
}
