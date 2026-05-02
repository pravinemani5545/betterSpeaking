"use client";

import { useState } from "react";
import { useInsights } from "@/hooks/use-insights";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/types";

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving")
    return <TrendingUp className="h-4 w-4 text-sage" strokeWidth={1.75} />;
  if (trend === "declining")
    return <TrendingDown className="h-4 w-4 text-rose" strokeWidth={1.75} />;
  return <Minus className="h-4 w-4 text-cream-500" strokeWidth={1.75} />;
}

function trendLabel(trend: string) {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Needs attention";
  return "Stable";
}

export function InsightsCard() {
  const { daily, weekly, loading, generatingDaily, generatingWeekly } =
    useInsights();
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  if (loading) {
    return (
      <div className="border border-cream-200 bg-white rounded-[14px] p-5 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
        <Skeleton className="h-20 w-full rounded-[10px]" />
      </div>
    );
  }

  const dailyContent = daily?.content as {
    tip?: string;
    based_on_count?: number;
  } | null;
  const weeklyContent = weekly?.content as {
    trend?: string;
    average_score?: number;
    category_scores?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    focus_areas?: string[];
    practice_exercise?: string;
    responses_analyzed?: number;
  } | null;

  return (
    <div className="space-y-4">
      {/* Daily Tip */}
      <div className="border border-cream-200 bg-white rounded-[14px] p-5 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-apricot" strokeWidth={1.75} />
          <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
            Today&apos;s tip
          </h3>
        </div>

        {generatingDaily ? (
          <div className="flex items-center gap-2 text-sm text-cream-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your recent responses...
          </div>
        ) : dailyContent?.tip ? (
          <p className="text-sm text-cream-700 leading-relaxed">
            {dailyContent.tip}
          </p>
        ) : (
          <p className="text-sm text-cream-500">
            Answer some questions to get personalized tips.
          </p>
        )}
      </div>

      {/* Weekly Report */}
      <div className="border border-cream-200 bg-white rounded-[14px] shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)] overflow-hidden">
        <button
          onClick={() => setWeeklyOpen(!weeklyOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cream-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {weeklyContent?.trend ? (
              <TrendIcon trend={weeklyContent.trend} />
            ) : (
              <TrendingUp
                className="h-4 w-4 text-cream-400"
                strokeWidth={1.75}
              />
            )}
            <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
              Weekly report
            </h3>
            {weeklyContent?.trend && (
              <span className="text-xs text-cream-500">
                — {trendLabel(weeklyContent.trend)}
              </span>
            )}
          </div>
          {weeklyOpen ? (
            <ChevronUp
              className="h-4 w-4 text-cream-500"
              strokeWidth={1.75}
            />
          ) : (
            <ChevronDown
              className="h-4 w-4 text-cream-500"
              strokeWidth={1.75}
            />
          )}
        </button>

        {weeklyOpen && (
          <div className="px-5 pb-5 space-y-4">
            {generatingWeekly ? (
              <div className="flex items-center gap-2 text-sm text-cream-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating weekly report...
              </div>
            ) : weeklyContent?.average_score != null ? (
              <>
                {/* Score + Stats */}
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-heading text-ink-soft">
                      {weeklyContent.average_score.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-cream-500">Avg score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-heading text-ink-soft">
                      {weeklyContent.responses_analyzed}
                    </p>
                    <p className="text-[10px] text-cream-500">Responses</p>
                  </div>
                </div>

                {/* Category Scores */}
                {weeklyContent.category_scores && (
                  <div>
                    <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] mb-2">
                      By category
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(weeklyContent.category_scores).map(
                        ([cat, score]) => (
                          <div
                            key={cat}
                            className="flex items-center justify-between bg-cream-50 rounded-[8px] px-3 py-1.5"
                          >
                            <span className="text-xs text-cream-600">
                              {CATEGORY_LABELS[
                                cat as keyof typeof CATEGORY_LABELS
                              ] || cat}
                            </span>
                            <span className="text-xs font-medium text-ink-soft">
                              {typeof score === "number"
                                ? score.toFixed(1)
                                : score}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  {weeklyContent.strengths &&
                    weeklyContent.strengths.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] mb-1.5">
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {weeklyContent.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-xs text-cream-700 leading-relaxed"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {weeklyContent.weaknesses &&
                    weeklyContent.weaknesses.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] mb-1.5">
                          Areas to improve
                        </p>
                        <ul className="space-y-1">
                          {weeklyContent.weaknesses.map((w, i) => (
                            <li
                              key={i}
                              className="text-xs text-cream-700 leading-relaxed"
                            >
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Focus Areas */}
                {weeklyContent.focus_areas &&
                  weeklyContent.focus_areas.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] mb-1.5">
                        Focus this week
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {weeklyContent.focus_areas.map((area, i) => (
                          <span
                            key={i}
                            className="text-xs bg-peach-50 text-peach-700 px-2.5 py-1 rounded-[6px]"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Practice Exercise */}
                {weeklyContent.practice_exercise && (
                  <div className="bg-cream-50 rounded-[10px] p-3">
                    <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] mb-1">
                      Practice exercise
                    </p>
                    <p className="text-xs text-cream-700 leading-relaxed">
                      {weeklyContent.practice_exercise}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-cream-500">
                Complete at least 2 responses this week to see your weekly
                report.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
