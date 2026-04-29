"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function createNote(content: string, title?: string) {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title: title || "" }),
    });
    if (!res.ok) {
      toast.error("Failed to create note");
      return null;
    }
    const note = await res.json();
    await fetchNotes();
    return note as Note;
  }

  async function updateNote(id: string, updates: { title?: string; content?: string }) {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      toast.error("Failed to save note");
      return false;
    }
    await fetchNotes();
    return true;
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete note");
      return false;
    }
    toast.success("Note deleted");
    await fetchNotes();
    return true;
  }

  return { notes, loading, createNote, updateNote, deleteNote, refetch: fetchNotes };
}
