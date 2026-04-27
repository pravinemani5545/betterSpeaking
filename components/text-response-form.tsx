"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import type { Analysis } from "@/types";

interface TextResponseFormProps {
  questionId: string;
  onSubmitted: (analysis?: Analysis) => void;
}

export function TextResponseForm({
  questionId,
  onSubmitted,
}: TextResponseFormProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "analyzing">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.length < 20) {
      toast.error("Response must be at least 20 characters");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          text_content: text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit response");
      }

      const responseData = await res.json();

      setStatus("analyzing");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response_id: responseData.id }),
      });

      if (!analyzeRes.ok) {
        toast.error("Response saved but analysis failed");
        onSubmitted();
        return;
      }

      const analysisData = await analyzeRes.json();
      toast.success("Response analyzed!");
      onSubmitted(analysisData);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit response"
      );
    } finally {
      setStatus("idle");
    }
  }

  const isLoading = status !== "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your answer here... Use the STAR method for behavioral questions (Situation, Task, Action, Result)."
          className="min-h-[200px] bg-white border-cream-300 rounded-[10px] resize-y focus:ring-peach-500/25 text-ink-soft placeholder:text-cream-400"
          maxLength={5000}
          disabled={isLoading}
        />
        <span className="absolute bottom-2 right-2 text-xs text-cream-500">
          {text.length}/5000
        </span>
      </div>

      <Button
        type="submit"
        disabled={isLoading || text.length < 20}
        className="bg-peach-500 text-white hover:bg-peach-600 rounded-[10px]"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : status === "analyzing" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing your response...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" strokeWidth={1.75} />
            Submit & analyze
          </>
        )}
      </Button>
    </form>
  );
}
