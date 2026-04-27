import { CategoryBadge } from "@/components/category-badge";
import { formatFullDate } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  servedDate: string;
  responded: boolean;
}

export function QuestionCard({
  question,
  servedDate,
  responded,
}: QuestionCardProps) {
  return (
    <div className="border border-border bg-card rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatFullDate(servedDate)}
        </span>
        <div className="flex items-center gap-2">
          <CategoryBadge category={question.category} />
          {responded && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Answered
            </span>
          )}
        </div>
      </div>
      <p className="text-lg leading-relaxed">{question.text}</p>
    </div>
  );
}
