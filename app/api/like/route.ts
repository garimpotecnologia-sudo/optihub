import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { postId } = await request.json();

    // Check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .single();

    if (existing) {
      // Unlike
      await supabase.from("likes").delete().eq("id", existing.id);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabase.from("likes").insert({
        user_id: user.id,
        post_id: postId,
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
