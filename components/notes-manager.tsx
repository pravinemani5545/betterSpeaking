"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useNotes, type Note } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Loader2, StickyNote, List, Link2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function NotesManager() {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  function insertBullet() {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const value = ta.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);

    let newContent: string;
    let newCursorPos: number;

    if (line.startsWith("• ")) {
      newContent = value.substring(0, lineStart) + line.substring(2) + value.substring(lineEnd === -1 ? value.length : lineEnd);
      newCursorPos = Math.max(lineStart, start - 2);
    } else {
      newContent = value.substring(0, lineStart) + "• " + value.substring(lineStart);
      newCursorPos = start + 2;
    }

    handleContentChange(newContent);
    requestAnimationFrame(() => {
      ta.selectionStart = newCursorPos;
      ta.selectionEnd = newCursorPos;
      ta.focus();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter") return;
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const value = ta.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const line = value.substring(lineStart, start);

    if (!line.startsWith("• ")) return;

    e.preventDefault();

    if (line.trim() === "•") {
      // Empty bullet — remove it
      const newContent = value.substring(0, lineStart) + value.substring(start);
      handleContentChange(newContent);
      requestAnimationFrame(() => {
        ta.selectionStart = lineStart;
        ta.selectionEnd = lineStart;
      });
    } else {
      // Continue bullet on next line
      const insert = "\n• ";
      const newContent = value.substring(0, start) + insert + value.substring(start);
      const newPos = start + insert.length;
      handleContentChange(newContent);
      requestAnimationFrame(() => {
        ta.selectionStart = newPos;
        ta.selectionEnd = newPos;
      });
    }
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
          <NoteList
            notes={notes}
            activeNote={activeNote}
            deletingId={deletingId}
            onSelect={handleSelectNote}
            onDelete={handleDelete}
          />
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
            <div className="flex items-center gap-1 px-4 py-1.5 border-b border-cream-100">
              <button
                type="button"
                onClick={insertBullet}
                className="p-1 rounded-[6px] text-cream-500 hover:text-ink-soft hover:bg-cream-100 transition-colors"
                title="Toggle bullet point (•)"
              >
                <List className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
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

function NoteList({
  notes,
  activeNote,
  deletingId,
  onSelect,
  onDelete,
}: {
  notes: Note[];
  activeNote: Note | null;
  deletingId: string | null;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const linked = notes.filter((n) => n.response_id);
  const personal = notes.filter((n) => !n.response_id);

  function renderItem(note: Note) {
    return (
      <div
        key={note.id}
        className={`group flex items-start gap-2 px-3 py-2.5 rounded-[10px] cursor-pointer transition-colors ${
          activeNote?.id === note.id
            ? "bg-peach-50 text-ink-soft"
            : "text-cream-700 hover:bg-cream-100"
        }`}
        onClick={() => onSelect(note)}
      >
        {note.response_id ? (
          <Link2
            className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-peach-400"
            strokeWidth={1.75}
          />
        ) : (
          <StickyNote
            className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-cream-500"
            strokeWidth={1.75}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{note.title || "Untitled"}</p>
          <p className="text-[10px] text-cream-500">
            {formatDate(note.updated_at)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
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
    );
  }

  // If no linked notes, just show flat list
  if (linked.length === 0) {
    return <div className="space-y-1">{personal.map(renderItem)}</div>;
  }

  return (
    <div className="space-y-3">
      {linked.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] px-3 mb-1">
            Linked to questions
          </p>
          <div className="space-y-1">{linked.map(renderItem)}</div>
        </div>
      )}
      {personal.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-cream-500 uppercase tracking-[0.04em] px-3 mb-1">
            Personal notes
          </p>
          <div className="space-y-1">{personal.map(renderItem)}</div>
        </div>
      )}
    </div>
  );
}
