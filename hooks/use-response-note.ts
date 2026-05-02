"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Note } from "@/hooks/use-notes";

export function useResponseNote(responseId: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNote = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?response_id=${responseId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNote(data.length > 0 ? data[0] : null);
    } catch {
      // silently fail — no note is fine
    } finally {
      setLoading(false);
    }
  }, [responseId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  async function createNote() {
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "",
          title: "",
          response_id: responseId,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNote(data);
    } catch {
      toast.error("Failed to create note");
    } finally {
      setSaving(false);
    }
  }

  function updateContent(content: string) {
    if (!note) return;
    setNote({ ...note, content });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/notes/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      } catch {
        toast.error("Failed to save note");
      }
    }, 1000);
  }

  return { note, loading, saving, createNote, updateContent };
}
