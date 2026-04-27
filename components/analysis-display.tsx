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
      <div className="border border-border bg-card rounded-lg p-6">
        <OverallScore score={analysis.overall_score} />
      </div>

      {/* Content Analysis */}
      <div className="border border-border bg-card rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Content Analysis
        </h3>
        <div className="space-y-3">
          <ScoreBar label="Relevance" score={content.relevance_score} />
          <ScoreBar label="Structure" score={content.structure_score} />
          <ScoreBar label="Depth" score={content.depth_score} />
          <ScoreBar label="Examples" score={content.example_usage_score} />
        </div>
        {content.summary && (
          <p className="text-sm text-muted-foreground mt-3">
            {content.summary}
          </p>
        )}
      </div>

      {/* Delivery Analysis (video only) */}
      {delivery && (
        <div className="border border-border bg-card rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
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
              <div className="text-2xl font-mono">{delivery.wpm}</div>
              <div className="text-xs text-muted-foreground">WPM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono">
                {delivery.filler_word_count}
              </div>
              <div className="text-xs text-muted-foreground">Filler Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono">
                {delivery.estimated_pauses}
              </div>
              <div className="text-xs text-muted-foreground">Pauses</div>
            </div>
          </div>

          {delivery.filler_words_detected.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Detected:{" "}
              {delivery.filler_words_detected.map((w) => `"${w}"`).join(", ")}
            </div>
          )}

          {delivery.summary && (
            <p className="text-sm text-muted-foreground mt-3">
              {delivery.summary}
            </p>
          )}
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-6 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <Sparkles className="h-4 w-4" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-sm text-foreground">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-6 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-amber-400">
            <Lightbulb className="h-4 w-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-foreground">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Response */}
      {analysis.improved_response && (
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <button
            onClick={() => setShowImproved(!showImproved)}
            className="w-full flex items-center justify-between p-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>View Improved Response</span>
            {showImproved ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showImproved && (
            <div className="px-4 pb-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {analysis.improved_response}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
