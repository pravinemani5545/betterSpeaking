"use client";

import { useState, useCallback, useEffect } from "react";
import type { DailyQuestion } from "@/types";
import { toast } from "sonner";

export function useDailyQuestion() {
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestion | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/questions/daily/refresh", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to refresh");
      }
      const data = await res.json();
      setDailyQuestion(data);
      toast.success("New question loaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to skip question"
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyQuestion();
  }, [fetchDailyQuestion]);

  return { dailyQuestion, loading, refreshing, refetch: fetchDailyQuestion, refresh };
}
