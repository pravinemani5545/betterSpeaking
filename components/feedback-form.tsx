"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  Bug,
  MessageSquare,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

type FeedbackType = "bug" | "feedback" | "feature";

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

const TYPE_OPTIONS: { value: FeedbackType; label: string; icon: typeof Bug }[] =
  [
    { value: "bug", label: "Bug", icon: Bug },
    { value: "feedback", label: "Feedback", icon: MessageSquare },
    { value: "feature", label: "Feature request", icon: Lightbulb },
  ];

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>("feedback");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subject.length < 3 || description.length < 10) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, description }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }

      toast.success("Thanks for your feedback!");
      setSubmitted(true);
      setSubject("");
      setDescription("");
      fetchHistory();

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Submit Form */}
      <form
        onSubmit={handleSubmit}
        className="border border-cream-200 bg-white rounded-[14px] p-5 space-y-4 shadow-[0_2px_6px_rgba(74,45,30,0.05),0_1px_2px_rgba(74,45,30,0.04)]"
      >
        {/* Type Selector */}
        <div className="flex gap-2">
          {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm transition-colors",
                type === value
                  ? "bg-peach-50 text-peach-700"
                  : "text-cream-600 hover:text-ink-soft hover:bg-cream-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary..."
          className="bg-cream-50 border-cream-300 rounded-[10px] text-ink-soft placeholder:text-cream-400"
          maxLength={200}
          required
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue or suggestion in detail..."
          className="bg-cream-50 border-cream-300 rounded-[10px] resize-y text-ink-soft placeholder:text-cream-400"
          rows={4}
          maxLength={5000}
          required
        />

        <Button
          type="submit"
          disabled={
            submitting || submitted || subject.length < 3 || description.length < 10
          }
          className="bg-peach-500 text-white hover:bg-peach-600 rounded-[10px]"
        >
          {submitted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Submitted
            </>
          ) : submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Submit
            </>
          )}
        </Button>
      </form>

      {/* Past Submissions */}
      {!loadingHistory && history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-cream-600 uppercase tracking-[0.04em]">
            Your submissions
          </h3>
          <div className="space-y-2">
            {history.map((item) => {
              const TypeIcon =
                TYPE_OPTIONS.find((t) => t.value === item.type)?.icon ?? MessageSquare;
              return (
                <div
                  key={item.id}
                  className="border border-cream-200 bg-white rounded-[14px] p-4 shadow-[0_1px_2px_rgba(74,45,30,0.04)]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIcon
                      className="h-3.5 w-3.5 text-cream-500"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm text-ink-soft font-medium">
                      {item.subject}
                    </span>
                    <span className="text-[10px] text-cream-500 ml-auto">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-cream-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
