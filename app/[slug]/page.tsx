import { notFound } from "next/navigation";
import { createAdminSupabase } from "@/lib/supabase-admin";
import LinktreeView from "./LinktreeView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LinktreePage({ params }: PageProps) {
  const { slug } = await params;

  const admin = createAdminSupabase();
  const { data: linktree } = await admin
    .from("linktrees")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!linktree) notFound();

  // Increment views (fire and forget)
  admin.from("linktrees").update({ views_count: (linktree.views_count || 0) + 1 }).eq("id", linktree.id).then(() => {});

  return <LinktreeView linktree={linktree} />;
}
