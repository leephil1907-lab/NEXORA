"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { LayoutGrid, ListChecks, MessageSquareText, Sparkles, UserRound } from "lucide-react";

const LINKS = [
  { href: "/tools", label: "Tools", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/chat", label: "Chat", icon: MessageSquareText },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Tool-first header — the reference sites' navigation flow. */
export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-xl" aria-label="NEXORA home">
          <Logo />
        </Link>
        <span className="rounded-full border border-rose/30 bg-rose/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-rose">
          18+
        </span>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none" aria-label="Main">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                  active ? "bg-white/[0.07] text-white" : "text-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <link.icon size={13} className={active ? "text-lime" : "text-dim"} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/credits"
          className="btn-primary hidden shrink-0 items-center gap-1.5 !px-4 !py-2 text-xs sm:inline-flex"
        >
          <Sparkles size={12} /> Upgrade
        </Link>
        <Link href="/studio" className="btn-secondary hidden shrink-0 !px-4 !py-2 text-xs lg:inline-flex">
          Studio
        </Link>
      </div>
    </header>
  );
}
