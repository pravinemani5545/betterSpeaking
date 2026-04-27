import { Badge } from "@/components/ui/badge";
import type { QuestionCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  behavioral: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  technical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  situational: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  leadership: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  problem_solving: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export function CategoryBadge({ category }: { category: QuestionCategory }) {
  return (
    <Badge variant="outline" className={CATEGORY_COLORS[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
