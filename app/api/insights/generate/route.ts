import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getGeminiClient } from "@/lib/gemini";
import {
  buildDailyInsightPrompt,
  buildWeeklyInsightPrompt,
} from "@/lib/analysis";
import { z } from "zod";

const GenerateSchema = z.object({
  type: z.enum(["daily", "weekly"]),
});

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { type } = parsed.data;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Determine period
  let periodStart: string;
  let periodEnd: string;
  let lookbackDays: number;
  let minResponses: number;

  if (type === "daily") {
    periodStart = todayStr;
    periodEnd = todayStr;
    lookbackDays = 2;
    minResponses = 1;
  } else {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    periodStart = weekStart.toISOString().split("T")[0];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    periodEnd = weekEnd.toISOString().split("T")[0];
    lookbackDays = 7;
    minResponses = 2;
  }

  // Check if already exists (idempotent)
  const { data: existing } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", type)
    .eq("period_start", periodStart)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Fetch recent responses with analyses
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffStr = cutoff.toISOString();

  const { data: responses } = await supabase
    .from("responses")
    .select("*, question:questions(text, category), analysis:analyses(*)")
    .eq("user_id", user.id)
    .gte("created_at", cutoffStr)
    .order("created_at", { ascending: false });

  // Filter to only responses with analyses
  const withAnalysis = (responses ?? []).filter(
    (r: Record<string, unknown>) => {
      const analysis = Array.isArray(r.analysis) ? r.analysis[0] : r.analysis;
      return analysis != null;
    }
  );

  if (withAnalysis.length < minResponses) {
    return NextResponse.json(
      {
        error:
          type === "daily"
            ? "Need at least 1 analyzed response to generate a daily tip"
            : "Need at least 2 analyzed responses this week for a weekly report",
      },
      { status: 400 }
    );
  }

  // Build response summaries
  const summaries = withAnalysis.map((r: Record<string, unknown>) => {
    const analysis = Array.isArray(r.analysis)
      ? (r.analysis as Record<string, unknown>[])[0]
      : (r.analysis as Record<string, unknown>);
    const question = r.question as Record<string, unknown>;
    return {
      question: (question?.text as string) || "Unknown",
      category: (question?.category as string) || "general",
      overall_score: (analysis?.overall_score as number) || 0,
      strengths: (analysis?.strengths as string[]) || [],
      suggestions: (analysis?.suggestions as string[]) || [],
      content_summary:
        ((analysis?.content_analysis as Record<string, unknown>)
          ?.summary as string) || "",
    };
  });

  // Generate via Gemini
  const prompt =
    type === "daily"
      ? buildDailyInsightPrompt(summaries)
      : buildWeeklyInsightPrompt(summaries);

  const gemini = getGeminiClient();
  const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse JSON (strip markdown fences if present)
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "");
  let content: Record<string, unknown>;
  try {
    content = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  // Store insight
  const { data: insight, error } = await supabase
    .from("insights")
    .insert({
      user_id: user.id,
      type,
      content,
      period_start: periodStart,
      period_end: periodEnd,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(insight, { status: 201 });
}
