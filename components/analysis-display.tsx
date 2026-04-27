"use client";

import { useState } from "react";
import type { Analysis } from "@/types";
import { OverallScore, ScoreBar } from "@/components/score-chart";
import { ChevronDown, ChevronUp, Lightbulb, Sparkles } from "lucide-react";

interface AnalysisDisplayProps {
  analysis: Analysis;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const [showImproved, setShowImproved] = useState(false);
  const content = analysis.content_analysis;
  const delivery = analysis.delivery_analysis;

  return (
    <div className="space-y-6">
      <div className="border border-cream-200 bg-white rounded-[14px] p-6 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
        <OverallScore score={analysis.overall_score} />
      </div>

      {/* Content Analysis */}
      <div className="border border-cream-200 bg-white rounded-[14px] p-6 space-y-4 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
        <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
          Content Analysis
        </h3>
        <div className="space-y-3">
          <ScoreBar label="Relevance" score={content.relevance_score} />
          <ScoreBar label="Structure" score={content.structure_score} />
          <ScoreBar label="Depth" score={content.depth_score} />
          <ScoreBar label="Examples" score={content.example_usage_score} />
        </div>
        {content.summary && (
          <p className="text-sm text-cream-600 mt-3">{content.summary}</p>
        )}
      </div>

      {/* Delivery Analysis (video only) */}
      {delivery && (
        <div className="border border-cream-200 bg-white rounded-[14px] p-6 space-y-4 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
          <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
            Delivery Analysis
          </h3>
          <div className="space-y-3">
            <ScoreBar label="Eye Contact" score={delivery.eye_contact_score} />
            <ScoreBar
              label="Body Language"
              score={delivery.body_language_score}
            />
            <ScoreBar label="Confidence" score={delivery.confidence_score} />
            <ScoreBar label="Pace" score={delivery.pace_score} />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-mono text-ink-soft">
                {delivery.wpm}
              </div>
              <div className="text-xs text-cream-500">WPM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-ink-soft">
                {delivery.filler_word_count}
              </div>
              <div className="text-xs text-cream-500">Filler Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-ink-soft">
                {delivery.estimated_pauses}
              </div>
              <div className="text-xs text-cream-500">Pauses</div>
            </div>
          </div>

          {delivery.filler_words_detected.length > 0 && (
            <div className="text-xs text-cream-500">
              Detected:{" "}
              {delivery.filler_words_detected.map((w) => `"${w}"`).join(", ")}
            </div>
          )}

          {delivery.summary && (
            <p className="text-sm text-cream-600 mt-3">{delivery.summary}</p>
          )}
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="border border-sage/30 bg-sage/10 rounded-[14px] p-6 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-cream-700">
            <Sparkles className="h-4 w-4 text-sage" strokeWidth={1.75} />
            Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-sm text-cream-700">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="border border-apricot/30 bg-apricot/10 rounded-[14px] p-6 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-cream-700">
            <Lightbulb className="h-4 w-4 text-peach-600" strokeWidth={1.75} />
            Areas to improve
          </h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-cream-700">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Response */}
      {analysis.improved_response && (
        <div className="border border-cream-200 bg-white rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(74,45,30,0.04)]">
          <button
            onClick={() => setShowImproved(!showImproved)}
            className="w-full flex items-center justify-between p-4 text-sm text-cream-600 hover:text-ink-soft hover:bg-cream-50 transition-colors"
          >
            <span>View improved response</span>
            {showImproved ? (
              <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
          {showImproved && (
            <div className="px-4 pb-4 border-t border-cream-200 pt-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-cream-700">
                {analysis.improved_response}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
