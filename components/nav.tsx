"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";
import { LogOut, Mic, Clock, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/dashboard", label: "Today", icon: Mic },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/questions", label: "Questions", icon: List },
];

export function Nav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="border-b border-cream-300 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-4 h-14">
        <Link
          href="/dashboard"
          className="font-heading text-xl text-ink-soft hover:text-peach-700 transition-colors"
        >
          BetterSpeaking
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm transition-colors",
                  isActive
                    ? "bg-peach-50 text-peach-700"
                    : "text-cream-600 hover:text-ink-soft hover:bg-cream-100"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {email && (
            <span className="text-xs text-cream-500 hidden md:inline">
              {email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-cream-500 hover:text-ink-soft hover:bg-cream-100"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
