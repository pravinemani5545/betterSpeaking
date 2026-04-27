import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { DEFAULT_QUESTIONS } from "@/lib/default-questions";
import { QUESTION_CATEGORIES } from "@/types";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Check if already served today
  const { data: existing } = await supabase
    .from("daily_questions")
    .select("*, question:questions(*)")
    .eq("user_id", user.id)
    .eq("served_date", today)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Seed defaults if user has zero questions
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 0) {
    const rows = DEFAULT_QUESTIONS.map((q) => ({
      user_id: user.id,
      text: q.text,
      category: q.category,
      is_default: true,
    }));
    await supabase.from("questions").insert(rows);
  }

  // Get recently served question IDs (last 30 days)
  const { data: recentlyServed } = await supabase
    .from("daily_questions")
    .select("question_id, served_date")
    .eq("user_id", user.id)
    .order("served_date", { ascending: false })
    .limit(30);

  const recentIds = new Set(recentlyServed?.map((r) => r.question_id) ?? []);

  // Determine last served category to rotate
  let lastCategory: string | null = null;
  if (recentlyServed && recentlyServed.length > 0) {
    const { data: lastQ } = await supabase
      .from("questions")
      .select("category")
      .eq("id", recentlyServed[0].question_id)
      .single();
    lastCategory = lastQ?.category ?? null;
  }

  // Rotate to next category
  const lastIdx = lastCategory
    ? QUESTION_CATEGORIES.indexOf(lastCategory as typeof QUESTION_CATEGORIES[number])
    : -1;
  const categoryOrder = [
    ...QUESTION_CATEGORIES.slice(lastIdx + 1),
    ...QUESTION_CATEGORIES.slice(0, lastIdx + 1),
  ];

  // Try each category in rotation order
  let selectedQuestionId: string | null = null;

  for (const category of categoryOrder) {
    const { data: candidates } = await supabase
      .from("questions")
      .select("id")
      .eq("user_id", user.id)
      .eq("category", category);

    if (!candidates || candidates.length === 0) continue;

    // Prefer unasked questions
    const unasked = candidates.filter((c) => !recentIds.has(c.id));
    if (unasked.length > 0) {
      selectedQuestionId =
        unasked[Math.floor(Math.random() * unasked.length)].id;
      break;
    }
  }

  // Fallback: any random question
  if (!selectedQuestionId) {
    const { data: allQuestions } = await supabase
      .from("questions")
      .select("id")
      .eq("user_id", user.id);

    if (allQuestions && allQuestions.length > 0) {
      selectedQuestionId =
        allQuestions[Math.floor(Math.random() * allQuestions.length)].id;
    }
  }

  if (!selectedQuestionId) {
    return NextResponse.json(
      { error: "No questions available. Add some questions first." },
      { status: 404 }
    );
  }

  // Insert daily question
  const { data: dailyQuestion, error } = await supabase
    .from("daily_questions")
    .insert({
      user_id: user.id,
      question_id: selectedQuestionId,
      served_date: today,
      responded: false,
    })
    .select("*, question:questions(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(dailyQuestion);
}
