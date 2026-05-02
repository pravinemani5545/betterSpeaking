import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { selectDailyQuestion } from "@/lib/daily-question";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Get current daily question
  const { data: current } = await supabase
    .from("daily_questions")
    .select("id, question_id, responded")
    .eq("user_id", user.id)
    .eq("served_date", today)
    .single();

  if (!current) {
    return NextResponse.json(
      { error: "No daily question to refresh" },
      { status: 404 }
    );
  }

  if (current.responded) {
    return NextResponse.json(
      { error: "Cannot skip a question you've already answered" },
      { status: 400 }
    );
  }

  // Pick a new question excluding the current one
  const selectedQuestionId = await selectDailyQuestion(supabase, user.id, [
    current.question_id,
  ]);

  if (!selectedQuestionId) {
    return NextResponse.json(
      { error: "No other questions available" },
      { status: 404 }
    );
  }

  // Update in-place (avoids unique constraint issue)
  const { data: dailyQuestion, error } = await supabase
    .from("daily_questions")
    .update({ question_id: selectedQuestionId })
    .eq("id", current.id)
    .select("*, question:questions(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(dailyQuestion);
}
