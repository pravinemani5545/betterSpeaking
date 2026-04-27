"use client";

import { useState, useCallback, useEffect } from "react";
import type { DailyQuestion } from "@/types";
import { toast } from "sonner";

export function useDailyQuestion() {
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestion | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchDailyQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions/daily");
      if (!res.ok) throw new Error("Failed to fetch daily question");
      const data = await res.json();
      setDailyQuestion(data);
    } catch {
      toast.error("Failed to load today's question");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyQuestion();
  }, [fetchDailyQuestion]);

  return { dailyQuestion, loading, refetch: fetchDailyQuestion };
}
