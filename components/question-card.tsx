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
    <div className="border border-cream-200 bg-white rounded-[14px] p-6 space-y-4 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-cream-600">
          {formatFullDate(servedDate)}
        </span>
        <div className="flex items-center gap-2">
          <CategoryBadge category={question.category} />
          {responded && (
            <span className="flex items-center gap-1 text-xs text-sage">
              <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              Answered
            </span>
          )}
        </div>
      </div>
      <p className="text-lg leading-relaxed text-ink-soft font-heading">
        {question.text}
      </p>
    </div>
  );
}
