import { QuestionPoolManager } from "@/components/question-pool-manager";

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-ink-soft">Question pool</h1>
        <p className="text-cream-600 text-sm mt-1">
          Manage your interview questions by category.
        </p>
      </div>
      <QuestionPoolManager />
    </div>
  );
}
