"use client";

import Link from "next/link";
import { CategoryBadge } from "@/components/category-badge";
import { AnalysisDisplay } from "@/components/analysis-display";
import { formatFullDate } from "@/lib/utils";
import { ArrowLeft, Type, Video } from "lucide-react";
import type { UserResponse } from "@/types";

interface ResponseDetailProps {
  response: UserResponse;
}

export function ResponseDetail({ response }: ResponseDetailProps) {
  const analysis = Array.isArray(response.analysis)
    ? response.analysis[0]
    : response.analysis;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/history"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Link>

      {/* Question */}
      {response.question && (
        <div className="border border-border bg-card rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {response.response_type === "text" ? (
                <Type className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Video className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {formatFullDate(response.created_at)}
              </span>
            </div>
            <CategoryBadge category={response.question.category} />
          </div>
          <p className="text-lg leading-relaxed">{response.question.text}</p>
        </div>
      )}

      {/* Response Content */}
      <div className="border border-border bg-card rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Your Response
        </h3>
        {response.response_type === "text" && response.text_content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {response.text_content}
          </p>
        )}
        {response.response_type === "video" && response.video_url && (
          <div className="space-y-4">
            <video
              src={response.video_url}
              controls
              className="w-full rounded-md aspect-video bg-black"
            />
            {response.transcript && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Transcript
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {response.transcript}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis */}
      {analysis && <AnalysisDisplay analysis={analysis} />}
    </div>
  );
}
