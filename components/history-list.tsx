"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResponses } from "@/hooks/use-responses";
import { CategoryBadge } from "@/components/category-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { Type, Video, ChevronLeft, ChevronRight } from "lucide-react";
import {
  QUESTION_CATEGORIES,
  CATEGORY_LABELS,
  type QuestionCategory,
} from "@/types";

function HistoryListInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as
    | QuestionCategory
    | undefined;
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [category, setCategory] = useState<QuestionCategory | undefined>(
    initialCategory || undefined
  );
  const [page, setPage] = useState(initialPage);
  const { responses, loading, total } = useResponses({ category, page });

  const totalPages = Math.ceil(total / 10);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => {
            setCategory(undefined);
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm transition-colors",
            !category
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {QUESTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm transition-colors",
              category === cat
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Response List */}
      {responses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No responses yet. Answer today&apos;s question to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {responses.map((r) => {
            const analysis = Array.isArray(r.analysis)
              ? r.analysis[0]
              : r.analysis;
            return (
              <Link
                key={r.id}
                href={`/dashboard/history/${r.id}`}
                className="flex items-center gap-4 border border-border bg-card rounded-lg p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-shrink-0 text-muted-foreground">
                  {r.response_type === "text" ? (
                    <Type className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {r.question?.text || "Question"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {r.question && (
                      <CategoryBadge category={r.question.category} />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                </div>
                {analysis && (
                  <div
                    className={cn(
                      "text-xl font-heading flex-shrink-0",
                      analysis.overall_score >= 7
                        ? "text-emerald-400"
                        : analysis.overall_score >= 4
                          ? "text-amber-400"
                          : "text-red-400"
                    )}
                  >
                    {analysis.overall_score}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function HistoryList() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      }
    >
      <HistoryListInner />
    </Suspense>
  );
}
