import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Sunday-aligned week start
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Fetch latest daily insight for today
  const { data: daily } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "daily")
    .eq("period_start", todayStr)
    .single();

  // Fetch latest weekly insight for current week
  const { data: weekly } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "weekly")
    .eq("period_start", weekStartStr)
    .single();

  return NextResponse.json({ daily: daily ?? null, weekly: weekly ?? null });
}
