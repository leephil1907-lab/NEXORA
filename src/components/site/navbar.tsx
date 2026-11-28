"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Boxes, Cpu, LayoutGrid, MessageSquareText, Shirt, Camera, Coins } from "lucide-react";

const LINKS = [
  { href: "/studio", label: "Studio", icon: Camera },
  { href: "/chat", label: "Chat", icon: MessageSquareText },
  { href: "/tools", label: "Tools", icon: LayoutGrid },
  { href: "/models", label: "Models", icon: Boxes },
  { href: "/studio/try-on", label: "Try-on", icon: Shirt },
  { href: "/studio/local", label: "Local", icon: Cpu },
  { href: "/credits", label: "Credits", icon: Coins },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-3 z-40 mx-3 rounded-2xl border border-white/[.13] bg-[#111a29]/65 shadow-[0_16px_50px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-2xl backdrop-saturate-150 sm:mx-5">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5">
        <Link href="/studio" className="flex shrink-0 items-center rounded-xl" aria-label="NEXORA home">
          <Logo />
        </Link>
        <span className="hidden h-7 w-px bg-white/10 md:block" />
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                className={`nav-link group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all duration-300 sm:px-3.5 ${active ? "border-white/[.16] bg-white/[.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18)]" : "border-transparent text-muted hover:border-white/10 hover:bg-white/[.055] hover:text-white"}`}>
                <link.icon size={15} strokeWidth={1.8} aria-hidden="true" className={`motion-icon ${active ? "text-lime" : "text-dim group-hover:text-white"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link href="/studio" className="liquid-surface hidden shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-semibold text-white/90 transition hover:border-lime/30 hover:bg-white/[.12] sm:inline-flex">
          <Coins size={14} className="motion-icon text-lime" /> Workspace
        </Link>
      </div>
    </header>
  );
}
