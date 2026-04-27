import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AnalyzeRequestSchema } from "@/lib/validators";
import { getClaudeClient } from "@/lib/claude";
import {
  buildTextAnalysisPrompt,
  buildVideoAnalysisPrompt,
} from "@/lib/analysis";
import type Anthropic from "@anthropic-ai/sdk";

const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
  "literally",
  "right",
  "so",
  "well",
  "I mean",
];

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AnalyzeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Fetch the response + question
  const { data: responseData, error: fetchError } = await supabase
    .from("responses")
    .select("*, question:questions(*)")
    .eq("id", parsed.data.response_id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !responseData) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  // Check if analysis already exists
  const { data: existingAnalysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("response_id", responseData.id)
    .single();

  if (existingAnalysis) {
    return NextResponse.json(existingAnalysis);
  }

  const claude = getClaudeClient();
  let analysisResult: Record<string, unknown>;

  if (responseData.response_type === "text") {
    const prompt = buildTextAnalysisPrompt(
      responseData.question.text,
      responseData.text_content
    );

    const message = await claude.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content[0];
    if (textContent.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 500 }
      );
    }

    try {
      analysisResult = JSON.parse(textContent.text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      );
    }
  } else {
    // Video analysis
    const prompt = buildVideoAnalysisPrompt(
      responseData.question.text,
      responseData.transcript || ""
    );

    const content: Anthropic.Messages.ContentBlockParam[] = [
      { type: "text", text: prompt },
    ];

    // Add frame images if provided
    const frames: string[] = parsed.data.frames ?? [];
    const selectedFrames = frames.slice(0, 10);

    for (const frame of selectedFrames) {
      const base64Data = frame.replace(/^data:image\/jpeg;base64,/, "");
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64Data,
        },
      });
    }

    const message = await claude.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 3000,
      messages: [{ role: "user", content }],
    });

    const textContent = message.content[0];
    if (textContent.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 500 }
      );
    }

    try {
      analysisResult = JSON.parse(textContent.text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      );
    }

    // Compute audio metrics from transcript
    const transcript = responseData.transcript || "";
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const wpm = responseData.duration_seconds
      ? Math.round((wordCount / responseData.duration_seconds) * 60)
      : 0;

    const transcriptLower = transcript.toLowerCase();
    let fillerWordCount = 0;
    const fillerWordsDetected: string[] = [];

    for (const word of FILLER_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = transcriptLower.match(regex);
      if (matches) {
        fillerWordCount += matches.length;
        fillerWordsDetected.push(word);
      }
    }

    const estimatedPauses = Math.max(
      0,
      Math.round((responseData.duration_seconds || 0) / 15) - 1
    );

    // Merge computed metrics into delivery_analysis
    const delivery = (analysisResult.delivery_analysis as Record<string, unknown>) ?? {};
    analysisResult.delivery_analysis = {
      ...delivery,
      filler_word_count: fillerWordCount,
      filler_words_detected: fillerWordsDetected,
      wpm,
      estimated_pauses: estimatedPauses,
    };
  }

  // Insert analysis
  const { data: analysis, error: insertError } = await supabase
    .from("analyses")
    .insert({
      response_id: responseData.id,
      overall_score: (analysisResult.overall_score as number) ?? 5,
      content_analysis: analysisResult.content_analysis ?? {},
      delivery_analysis: analysisResult.delivery_analysis ?? null,
      suggestions: (analysisResult.suggestions as string[]) ?? [],
      strengths: (analysisResult.strengths as string[]) ?? [],
      improved_response: (analysisResult.improved_response as string) ?? "",
      raw_json: analysisResult,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(analysis, { status: 201 });
}
