"use client";

import { useState, useCallback, useEffect } from "react";
import type { Question, QuestionCategory } from "@/types";
import { toast } from "sonner";

export function useQuestions(category?: QuestionCategory) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      const res = await fetch(`/api/questions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  async function addQuestion(text: string, cat: QuestionCategory) {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category: cat }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Failed to add question");
      return false;
    }
    toast.success("Question added");
    await fetchQuestions();
    return true;
  }

  async function deleteQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete question");
      return false;
    }
    toast.success("Question removed");
    await fetchQuestions();
    return true;
  }

  return { questions, loading, refetch: fetchQuestions, addQuestion, deleteQuestion };
}
