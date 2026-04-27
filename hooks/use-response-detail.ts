"use client";

import { useState, useCallback, useEffect } from "react";
import type { UserResponse } from "@/types";
import { toast } from "sonner";

export function useResponseDetail(id: string) {
  const [response, setResponse] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResponse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/responses/${id}`);
      if (!res.ok) throw new Error("Failed to fetch response");
      const data = await res.json();
      setResponse(data);
    } catch {
      toast.error("Failed to load response details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResponse();
  }, [fetchResponse]);

  return { response, loading, refetch: fetchResponse };
}
