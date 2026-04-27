"use client";

import { useState } from "react";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CategoryBadge } from "@/components/category-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  QUESTION_CATEGORIES,
  CATEGORY_LABELS,
  type QuestionCategory,
} from "@/types";

export function QuestionPoolManager() {
  const [filter, setFilter] = useState<QuestionCategory | undefined>(undefined);
  const { questions, loading, addQuestion, deleteQuestion } =
    useQuestions(filter);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<QuestionCategory>("behavioral");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (newText.length < 10) return;
    setAdding(true);
    const success = await addQuestion(newText, newCategory);
    if (success) {
      setNewText("");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteQuestion(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Add Question Form */}
      <form
        onSubmit={handleAdd}
        className="border border-border bg-card rounded-lg p-4 space-y-3"
      >
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Write a new interview question (min 10 characters)..."
          className="bg-secondary border-border resize-none"
          rows={2}
          maxLength={500}
        />
        <div className="flex items-center gap-3">
          <select
            value={newCategory}
            onChange={(e) =>
              setNewCategory(e.target.value as QuestionCategory)
            }
            className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
          >
            {QUESTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            size="sm"
            disabled={adding || newText.length < 10}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="ml-1.5">Add</span>
          </Button>
          <span className="text-xs text-muted-foreground ml-auto">
            {newText.length}/500
          </span>
        </div>
      </form>

      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilter(undefined)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm transition-colors",
            !filter
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {QUESTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm transition-colors",
              filter === cat
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Question List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No questions yet. Add some above or they&apos;ll be seeded
          automatically when you visit the dashboard.
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="group flex items-start gap-3 border border-border bg-card rounded-lg p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">{q.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge category={q.category} />
                  {q.is_default && (
                    <span className="text-xs text-muted-foreground">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(q.id)}
                disabled={deletingId === q.id}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                {deletingId === q.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
