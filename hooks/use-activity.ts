"use client";

import { useState, useEffect } from "react";

export function useActivity() {
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/responses/activity");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setActivity(data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  return { activity, loading };
}
