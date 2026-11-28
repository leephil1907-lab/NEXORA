"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

/** Slim, crisp footer — no decorative blur, real links only. */
export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2" aria-label="NEXORA home">
            <Logo />
          </Link>
          <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-dim">
            Advanced AI image &amp; video generation for consenting adults. Real engines,
            real jobs, automatic failure refunds.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted" aria-label="Footer">
          <Link href="/tools" className="hover:text-white">Tools</Link>
          <Link href="/tasks" className="hover:text-white">Tasks</Link>
          <Link href="/chat" className="hover:text-white">Chat</Link>
          <Link href="/credits" className="hover:text-white">Upgrade</Link>
          <Link href="/profile" className="hover:text-white">Profile</Link>
          <Link href="/legal/terms" className="hover:text-white">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-5 py-4 text-[10px] text-white/30">
          <p>© {new Date().getFullYear()} NEXORA AI. Adults only — 18+.</p>
          <p>Content must comply with local law. No real-person manipulation.</p>
        </div>
      </div>
    </footer>
  );
}
