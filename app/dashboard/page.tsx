"use client";

import { useState } from "react";
import { useDailyQuestion } from "@/hooks/use-daily-question";
import { QuestionCard } from "@/components/question-card";
import { TextResponseForm } from "@/components/text-response-form";
import { VideoRecorder } from "@/components/video-recorder";
import { AnalysisDisplay } from "@/components/analysis-display";
import { HeatMap } from "@/components/heat-map";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Type, Video, RefreshCw } from "lucide-react";
import type { Analysis } from "@/types";

export default function DashboardPage() {
  const { dailyQuestion, loading, refreshing, refetch, refresh } = useDailyQuestion();
  const [mode, setMode] = useState<"text" | "video">("text");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmitted(analysisData?: Analysis) {
    setSubmitted(true);
    if (analysisData) setAnalysis(analysisData);
    refetch();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-[14px]" />
        <Skeleton className="h-64 w-full rounded-[14px]" />
      </div>
    );
  }

  const alreadyAnswered = dailyQuestion?.responded;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-ink-soft">
          Today&apos;s question
        </h1>
        <p className="text-cream-600 text-sm mt-1">
          Practice makes progress.
        </p>
      </div>

      {dailyQuestion?.question && (
        <QuestionCard
          question={dailyQuestion.question}
          servedDate={dailyQuestion.served_date}
          responded={dailyQuestion.responded}
        />
      )}

      {!alreadyAnswered && !submitted && dailyQuestion && (
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm text-cream-500 hover:text-peach-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            strokeWidth={1.75}
          />
          {refreshing ? "Loading new question..." : "Skip question"}
        </button>
      )}

      {!alreadyAnswered && !submitted && dailyQuestion && (
        <>
          <div className="flex gap-1 p-1 bg-cream-100 rounded-[10px] w-fit">
            <button
              onClick={() => setMode("text")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-sm transition-colors",
                mode === "text"
                  ? "bg-white text-ink-soft shadow-[0_1px_2px_rgba(74,45,30,0.04)]"
                  : "text-cream-600 hover:text-ink-soft"
              )}
            >
              <Type className="h-4 w-4" strokeWidth={1.75} />
              Type answer
            </button>
            <button
              onClick={() => setMode("video")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-sm transition-colors",
                mode === "video"
                  ? "bg-white text-ink-soft shadow-[0_1px_2px_rgba(74,45,30,0.04)]"
                  : "text-cream-600 hover:text-ink-soft"
              )}
            >
              <Video className="h-4 w-4" strokeWidth={1.75} />
              Record video
            </button>
          </div>

          {mode === "text" ? (
            <TextResponseForm
              questionId={dailyQuestion.question_id}
              onSubmitted={handleSubmitted}
            />
          ) : (
            <VideoRecorder
              questionId={dailyQuestion.question_id}
              onSubmitted={handleSubmitted}
            />
          )}
        </>
      )}

      {(submitted || alreadyAnswered) && !analysis && (
        <div className="text-center py-8 text-cream-500">
          {alreadyAnswered && !submitted
            ? "You've already answered today's question. Check your history for the analysis."
            : "Processing your response..."}
        </div>
      )}

      {analysis && <AnalysisDisplay analysis={analysis} />}

      <HeatMap />
    </div>
  );
}
