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

  // Get all response dates for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabase
    .from("responses")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by date, count responses per day
  const activity: Record<string, number> = {};
  for (const row of data ?? []) {
    const date = row.created_at.split("T")[0];
    activity[date] = (activity[date] || 0) + 1;
  }

  return NextResponse.json(activity);
}
