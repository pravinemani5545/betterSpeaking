"use client";

import { useState } from "react";
import { useResponseNote } from "@/hooks/use-response-note";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, Loader2, Save } from "lucide-react";

interface ResponseNoteProps {
  responseId: string;
  questionText?: string;
}

export function ResponseNote({ responseId, questionText }: ResponseNoteProps) {
  const { note, loading, saving, createNote, updateContent, saveNote } =
    useResponseNote(responseId, questionText);
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  if (loading) return null;

  function handleChange(value: string) {
    updateContent(value);
    setDirty(true);
  }

  async function handleSave() {
    await saveNote();
    setDirty(false);
  }

  return (
    <div className="border border-cream-200 bg-white rounded-[14px] shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-cream-50 transition-colors"
      >
        <span className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
          My notes
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-cream-500" strokeWidth={1.75} />
        ) : (
          <ChevronDown className="h-4 w-4 text-cream-500" strokeWidth={1.75} />
        )}
      </button>

      {open && (
        <div className="px-5 pb-4">
          {note ? (
            <div className="space-y-2">
              <Textarea
                value={note.content}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Write your notes about this response..."
                className="border border-cream-200 rounded-[10px] px-4 py-3 resize-none text-sm text-cream-700 placeholder:text-cream-400 focus-visible:ring-peach-300 min-h-[120px] bg-cream-50/50"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cream-500">
                  {dirty ? "Unsaved changes" : "Saved"}
                </span>
                <button
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded-[8px] bg-peach-500 text-white hover:bg-peach-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" strokeWidth={1.75} />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={createNote}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm text-peach-600 hover:text-peach-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              Add notes
            </button>
          )}
        </div>
      )}
    </div>
  );
}
