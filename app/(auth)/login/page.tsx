"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message?.includes("rate") || error.status === 429) {
        toast.error(
          "Email rate limit reached. Please wait a few minutes before trying again."
        );
      } else {
        toast.error(error.message || "Failed to send magic link");
      }
    } else {
      toast.success("Check your email for the magic link");
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-5xl tracking-tight">
            BetterSpeaking
          </h1>
          <p className="text-muted-foreground text-sm">
            Daily practice. Real feedback. Better interviews.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="border border-border bg-card rounded-lg p-6 space-y-3">
              <p className="text-sm">
                Magic link sent to <span className="font-medium">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Check your inbox (and spam folder). The link expires in 1 hour.
              </p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Didn&apos;t receive it? Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send magic link"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Free tier: limited to a few emails per hour
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
