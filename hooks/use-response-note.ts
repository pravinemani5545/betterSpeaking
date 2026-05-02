"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Note } from "@/hooks/use-notes";

export function useResponseNote(responseId: string, questionText?: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          title: questionText || "",
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
  }

  async function saveNote() {
    if (!note) return;
    setSaving(true);
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      });
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  return { note, loading, saving, createNote, updateContent, saveNote };
}
