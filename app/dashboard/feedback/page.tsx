import { FeedbackForm } from "@/components/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-ink-soft">Feedback</h1>
        <p className="text-cream-600 text-sm mt-1">
          Report a bug, share feedback, or request a feature.
        </p>
      </div>
      <FeedbackForm />
    </div>
  );
}
