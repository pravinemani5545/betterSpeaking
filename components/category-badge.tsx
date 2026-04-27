import { Badge } from "@/components/ui/badge";
import type { QuestionCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  behavioral: "bg-peach-50 text-peach-700 border-peach-200",
  technical: "bg-sage/20 text-cream-700 border-sage/40",
  situational: "bg-blush/20 text-cream-700 border-blush/40",
  leadership: "bg-apricot/20 text-cream-800 border-apricot/40",
  problem_solving: "bg-rose/10 text-rose border-rose/20",
};

export function CategoryBadge({ category }: { category: QuestionCategory }) {
  return (
    <Badge variant="outline" className={CATEGORY_COLORS[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
