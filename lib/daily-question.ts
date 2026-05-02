import { SupabaseClient } from "@supabase/supabase-js";
import { QUESTION_CATEGORIES } from "@/types";

/**
 * Weighted random selection for daily questions.
 * Weight = 1 / (1 + times_served). Fresh questions = 1.0, served once = 0.5, etc.
 */
export async function selectDailyQuestion(
  supabase: SupabaseClient,
  userId: string,
  excludeIds: string[] = []
): Promise<string | null> {
  // Get all user questions
  const { data: allQuestions } = await supabase
    .from("questions")
    .select("id, category")
    .eq("user_id", userId);

  if (!allQuestions || allQuestions.length === 0) return null;

  // Count how many times each question has been served
  const { data: servedRows } = await supabase
    .from("daily_questions")
    .select("question_id")
    .eq("user_id", userId);

  const serveCounts: Record<string, number> = {};
  for (const row of servedRows ?? []) {
    serveCounts[row.question_id] = (serveCounts[row.question_id] || 0) + 1;
  }

  // Determine last category to rotate
  const { data: lastServed } = await supabase
    .from("daily_questions")
    .select("question_id")
    .eq("user_id", userId)
    .order("served_date", { ascending: false })
    .limit(1)
    .single();

  let lastCategory: string | null = null;
  if (lastServed) {
    const q = allQuestions.find((q) => q.id === lastServed.question_id);
    lastCategory = q?.category ?? null;
  }

  // Build category rotation order
  const lastIdx = lastCategory
    ? QUESTION_CATEGORIES.indexOf(lastCategory as (typeof QUESTION_CATEGORIES)[number])
    : -1;
  const categoryOrder = [
    ...QUESTION_CATEGORIES.slice(lastIdx + 1),
    ...QUESTION_CATEGORIES.slice(0, lastIdx + 1),
  ];

  // Try each category in rotation order
  for (const category of categoryOrder) {
    const candidates = allQuestions.filter(
      (q) => q.category === category && !excludeIds.includes(q.id)
    );
    if (candidates.length === 0) continue;

    const selected = weightedRandom(candidates, serveCounts);
    if (selected) return selected;
  }

  // Fallback: weighted random across all categories
  const remaining = allQuestions.filter((q) => !excludeIds.includes(q.id));
  if (remaining.length === 0) return null;

  return weightedRandom(remaining, serveCounts);
}

function weightedRandom(
  candidates: { id: string }[],
  serveCounts: Record<string, number>
): string | null {
  if (candidates.length === 0) return null;

  const weights = candidates.map((c) => 1 / (1 + (serveCounts[c.id] || 0)));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let rand = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return candidates[i].id;
  }

  return candidates[candidates.length - 1].id;
}
