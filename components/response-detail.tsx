"use client";

import Link from "next/link";
import { CategoryBadge } from "@/components/category-badge";
import { AnalysisDisplay } from "@/components/analysis-display";
import { formatFullDate } from "@/lib/utils";
import { ArrowLeft, Type, Video } from "lucide-react";
import { ResponseNote } from "@/components/response-note";
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
        className="flex items-center gap-1 text-sm text-cream-600 hover:text-peach-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to history
      </Link>

      {/* Question */}
      {response.question && (
        <div className="border border-cream-200 bg-white rounded-[14px] p-6 space-y-3 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {response.response_type === "text" ? (
                <Type className="h-4 w-4 text-cream-500" strokeWidth={1.75} />
              ) : (
                <Video className="h-4 w-4 text-cream-500" strokeWidth={1.75} />
              )}
              <span className="text-xs text-cream-600">
                {formatFullDate(response.created_at)}
              </span>
            </div>
            <CategoryBadge category={response.question.category} />
          </div>
          <p className="text-lg leading-relaxed text-ink-soft font-heading">
            {response.question.text}
          </p>
        </div>
      )}

      {/* Response Content */}
      <div className="border border-cream-200 bg-white rounded-[14px] p-6 space-y-3 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
        <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
          Your response
        </h3>
        {response.response_type === "text" && response.text_content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-cream-700">
            {response.text_content}
          </p>
        )}
        {response.response_type === "video" && response.video_url && (
          <div className="space-y-4">
            <video
              src={response.video_url}
              controls
              className="w-full rounded-[10px] aspect-video bg-cream-900"
            />
            {response.transcript && (
              <div>
                <p className="text-xs text-cream-500 mb-1">Transcript</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-cream-600">
                  {response.transcript}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis */}
      {analysis && <AnalysisDisplay analysis={analysis} />}

      {/* Notes */}
      <ResponseNote responseId={response.id} />
    </div>
  );
}
