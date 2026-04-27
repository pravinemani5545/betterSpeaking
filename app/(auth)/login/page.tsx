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
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="font-heading text-5xl tracking-tight text-ink-soft">
              BetterSpeaking
            </h1>
            <p className="text-cream-600 text-sm">
              Daily practice. Real feedback. Better interviews.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="border border-border bg-card rounded-[14px] p-6 space-y-3 shadow-sm">
                <p className="text-sm text-ink-soft">
                  Magic link sent to{" "}
                  <span className="font-medium">{email}</span>
                </p>
                <p className="text-xs text-cream-600">
                  Check your inbox (and spam folder). The link expires in 1
                  hour.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-cream-600 hover:text-peach-700 transition-colors"
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
                className="bg-white border-cream-300 rounded-[10px] focus:ring-peach-500/25"
                required
              />
              <Button
                type="submit"
                className="w-full bg-cream-900 text-white hover:bg-cream-800 rounded-[10px]"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send magic link"}
              </Button>
              <p className="text-xs text-center text-cream-500">
                Free tier: limited to a few emails per hour
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Right: Decorative peach panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-peach-50 via-peach-100 to-peach-200 relative overflow-hidden">
        <div className="text-center space-y-4 z-10">
          <p className="font-heading text-6xl text-peach-700 italic">
            Practice
          </p>
          <p className="text-cream-600 text-sm max-w-xs mx-auto">
            Soft tools for warm work. Answer questions daily, get thoughtful
            feedback, grow.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-peach-200/40" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-peach-300/30" />
      </div>
    </div>
  );
}
