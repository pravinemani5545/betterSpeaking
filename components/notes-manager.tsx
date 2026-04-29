"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useNotes, type Note } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Loader2, StickyNote } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function NotesManager() {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set first note as active when loaded
  useEffect(() => {
    if (!activeNote && notes.length > 0) {
      setActiveNote(notes[0]);
      setTitle(notes[0].title);
      setContent(notes[0].content);
    }
  }, [notes, activeNote]);

  // Auto-save with debounce
  const autoSave = useCallback(
    (noteId: string, newTitle: string, newContent: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        updateNote(noteId, { title: newTitle, content: newContent });
      }, 1000);
    },
    [updateNote]
  );

  function handleSelectNote(note: Note) {
    // Save current note immediately if pending
    if (saveTimerRef.current && activeNote) {
      clearTimeout(saveTimerRef.current);
      updateNote(activeNote.id, { title, content });
    }
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (activeNote) autoSave(activeNote.id, newTitle, content);
  }

  function handleContentChange(newContent: string) {
    setContent(newContent);
    if (activeNote) autoSave(activeNote.id, title, newContent);
  }

  async function handleCreate() {
    setCreating(true);
    const note = await createNote("", "Untitled");
    if (note) {
      setActiveNote(note);
      setTitle(note.title);
      setContent(note.content);
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteNote(id);
    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      setContent("");
    }
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-[14px]" />
        <Skeleton className="h-64 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* Sidebar: Note list */}
      <div className="w-56 flex-shrink-0 space-y-2">
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-peach-500 text-white hover:bg-peach-600 rounded-[10px]"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" strokeWidth={1.75} />
          )}
          New note
        </Button>

        {notes.length === 0 ? (
          <div className="text-center py-8 text-cream-500 text-xs">
            No notes yet
          </div>
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group flex items-start gap-2 px-3 py-2.5 rounded-[10px] cursor-pointer transition-colors ${
                  activeNote?.id === note.id
                    ? "bg-peach-50 text-ink-soft"
                    : "text-cream-700 hover:bg-cream-100"
                }`}
                onClick={() => handleSelectNote(note)}
              >
                <StickyNote
                  className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-cream-500"
                  strokeWidth={1.75}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {note.title || "Untitled"}
                  </p>
                  <p className="text-[10px] text-cream-500">
                    {formatDate(note.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  disabled={deletingId === note.id}
                  className="opacity-0 group-hover:opacity-100 text-cream-500 hover:text-rose transition-all p-0.5"
                >
                  {deletingId === note.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 border border-cream-200 bg-white rounded-[14px] shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)] overflow-hidden">
        {activeNote ? (
          <div className="flex flex-col h-full">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className="border-0 border-b border-cream-200 rounded-none px-5 py-4 text-lg font-heading text-ink-soft placeholder:text-cream-400 focus-visible:ring-0 bg-transparent"
            />
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your thoughts..."
              className="flex-1 border-0 rounded-none px-5 py-4 resize-none text-sm text-cream-700 placeholder:text-cream-400 focus-visible:ring-0 bg-transparent min-h-[400px]"
            />
            <div className="px-5 py-2 border-t border-cream-100 text-[10px] text-cream-500">
              Auto-saves as you type
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-cream-500 text-sm">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
