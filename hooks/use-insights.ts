"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface InsightRecord {
  id: string;
  user_id: string;
  type: "daily" | "weekly";
  content: Record<string, unknown>;
  period_start: string;
  period_end: string;
  created_at: string;
}

export function useInsights() {
  const [daily, setDaily] = useState<InsightRecord | null>(null);
  const [weekly, setWeekly] = useState<InsightRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingDaily, setGeneratingDaily] = useState(false);
  const [generatingWeekly, setGeneratingWeekly] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDaily(data.daily);
      setWeekly(data.weekly);
      return data;
    } catch {
      // silently fail
      return { daily: null, weekly: null };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInsight = useCallback(
    async (type: "daily" | "weekly") => {
      const setGenerating =
        type === "daily" ? setGeneratingDaily : setGeneratingWeekly;
      const setResult = type === "daily" ? setDaily : setWeekly;

      setGenerating(true);
      try {
        const res = await fetch("/api/insights/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (!res.ok) {
          // Not enough data — that's fine, don't show error
          return;
        }
        const data = await res.json();
        setResult(data);
      } catch {
        toast.error(`Failed to generate ${type} insight`);
      } finally {
        setGenerating(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchInsights().then((data) => {
      // Auto-generate missing insights
      if (!data?.daily) generateInsight("daily");
      if (!data?.weekly) generateInsight("weekly");
    });
  }, [fetchInsights, generateInsight]);

  return { daily, weekly, loading, generatingDaily, generatingWeekly };
}
