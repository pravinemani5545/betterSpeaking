import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
}

export function ScoreBar({ label, score, maxScore = 10 }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const color =
    score >= 7
      ? "bg-sage"
      : score >= 4
        ? "bg-apricot"
        : "bg-rose";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-cream-600">{label}</span>
        <span className="font-mono text-cream-700">
          {score}/{maxScore}
        </span>
      </div>
      <div className="h-2 rounded-full bg-cream-200">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface OverallScoreProps {
  score: number;
}

export function OverallScore({ score }: OverallScoreProps) {
  const color =
    score >= 7
      ? "text-sage"
      : score >= 4
        ? "text-apricot"
        : "text-rose";

  return (
    <div className="flex items-center gap-3">
      <span className={cn("text-5xl font-heading", color)}>{score}</span>
      <div className="text-sm text-cream-600">
        <div>Overall</div>
        <div>Score</div>
      </div>
    </div>
  );
}
