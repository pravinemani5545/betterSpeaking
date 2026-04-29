import { NotesManager } from "@/components/notes-manager";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-ink-soft">Notes</h1>
        <p className="text-cream-600 text-sm mt-1">
          Jot down thoughts, prep notes, and reflections.
        </p>
      </div>
      <NotesManager />
    </div>
  );
}
