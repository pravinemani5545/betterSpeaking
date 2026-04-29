"use client";

import { useState } from "react";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CategoryBadge } from "@/components/category-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Loader2, List } from "lucide-react";
import {
  QUESTION_CATEGORIES,
  CATEGORY_LABELS,
  type QuestionCategory,
} from "@/types";

export function QuestionPoolManager() {
  const [filter, setFilter] = useState<QuestionCategory | undefined>(undefined);
  const { questions, loading, addQuestion, addBulkQuestions, deleteQuestion } =
    useQuestions(filter);
  const [newText, setNewText] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [newCategory, setNewCategory] =
    useState<QuestionCategory>("behavioral");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "bulk">("single");

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

  async function handleBulkAdd(e: React.FormEvent) {
    e.preventDefault();
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 10);

    if (lines.length === 0) return;

    setAdding(true);
    const items = lines.map((text) => ({ text, category: newCategory }));
    const success = await addBulkQuestions(items);
    if (success) {
      setBulkText("");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteQuestion(id);
    setDeletingId(null);
  }

  const bulkLineCount = bulkText
    .split("\n")
    .filter((l) => l.trim().length >= 10).length;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-cream-100 rounded-[10px] w-fit">
        <button
          onClick={() => setMode("single")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-sm transition-colors",
            mode === "single"
              ? "bg-white text-ink-soft shadow-[0_1px_2px_rgba(74,45,30,0.04)]"
              : "text-cream-600 hover:text-ink-soft"
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Single
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-sm transition-colors",
            mode === "bulk"
              ? "bg-white text-ink-soft shadow-[0_1px_2px_rgba(74,45,30,0.04)]"
              : "text-cream-600 hover:text-ink-soft"
          )}
        >
          <List className="h-4 w-4" strokeWidth={1.75} />
          Bulk add
        </button>
      </div>

      {/* Add Question Form */}
      {mode === "single" ? (
        <form
          onSubmit={handleAdd}
          className="border border-cream-200 bg-white rounded-[14px] p-4 space-y-3 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]"
        >
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write a new interview question (min 10 characters)..."
            className="bg-cream-50 border-cream-300 rounded-[10px] resize-none text-ink-soft placeholder:text-cream-400"
            rows={2}
            maxLength={500}
          />
          <div className="flex items-center gap-3">
            <select
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as QuestionCategory)
              }
              className="bg-cream-50 border border-cream-300 rounded-[10px] px-3 py-1.5 text-sm text-ink-soft"
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
              className="bg-peach-500 text-white hover:bg-peach-600 rounded-[10px]"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              )}
              <span className="ml-1.5">Add</span>
            </Button>
            <span className="text-xs text-cream-500 ml-auto">
              {newText.length}/500
            </span>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleBulkAdd}
          className="border border-cream-200 bg-white rounded-[14px] p-4 space-y-3 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]"
        >
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Paste multiple questions, one per line:\n\nTell me about a time you led a project...\nHow do you handle conflict in a team?\nDescribe your approach to debugging..."}
            className="bg-cream-50 border-cream-300 rounded-[10px] resize-y text-ink-soft placeholder:text-cream-400 font-mono text-sm"
            rows={8}
          />
          <div className="flex items-center gap-3">
            <select
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as QuestionCategory)
              }
              className="bg-cream-50 border border-cream-300 rounded-[10px] px-3 py-1.5 text-sm text-ink-soft"
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
              disabled={adding || bulkLineCount === 0}
              className="bg-peach-500 text-white hover:bg-peach-600 rounded-[10px]"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              )}
              <span className="ml-1.5">
                Add {bulkLineCount > 0 ? `${bulkLineCount} questions` : ""}
              </span>
            </Button>
            <span className="text-xs text-cream-500 ml-auto">
              {bulkLineCount} valid {bulkLineCount === 1 ? "line" : "lines"}
            </span>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilter(undefined)}
          className={cn(
            "px-3 py-1.5 rounded-[10px] text-sm transition-colors",
            !filter
              ? "bg-peach-50 text-peach-700"
              : "text-cream-600 hover:text-ink-soft hover:bg-cream-100"
          )}
        >
          All
        </button>
        {QUESTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-[10px] text-sm transition-colors",
              filter === cat
                ? "bg-peach-50 text-peach-700"
                : "text-cream-600 hover:text-ink-soft hover:bg-cream-100"
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
            <Skeleton key={i} className="h-16 w-full rounded-[14px]" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-cream-500">
          No questions yet. Add some above to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="group flex items-start gap-3 border border-cream-200 bg-white rounded-[14px] p-4 hover:bg-peach-50/50 transition-colors shadow-[0_1px_2px_rgba(74,45,30,0.04)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed text-ink-soft">
                  {q.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge category={q.category} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(q.id)}
                disabled={deletingId === q.id}
                className="opacity-0 group-hover:opacity-100 text-cream-500 hover:text-rose transition-all"
              >
                {deletingId === q.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
