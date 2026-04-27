"use client";

import { useState, useCallback, useEffect } from "react";
import type { UserResponse, QuestionCategory } from "@/types";
import { toast } from "sonner";

export function useResponses(filters?: {
  category?: QuestionCategory;
  page?: number;
}) {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.page) params.set("page", String(filters.page));
      const res = await fetch(`/api/responses?${params}`);
      if (!res.ok) throw new Error("Failed to fetch responses");
      const data = await res.json();
      setResponses(data.responses);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load responses");
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.page]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  return { responses, loading, total, refetch: fetchResponses };
}
