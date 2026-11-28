"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Boxes, Cpu, LayoutGrid, MessageSquare, Shirt, WandSparkles, Zap } from "lucide-react";

const LINKS = [
  { href: "/", label: "Studio", icon: WandSparkles },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/tools", label: "Tools", icon: LayoutGrid },
  { href: "/models", label: "Models", icon: Boxes },
  { href: "/studio/try-on", label: "Try-on", icon: Shirt },
  { href: "/studio/local", label: "Local", icon: Cpu },
  { href: "/credits", label: "Credits", icon: Zap },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#090d16]/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center rounded-xl" aria-label="NEXORA home">
          <Logo />
        </Link>
        <span className="hidden h-7 w-px bg-white/10 md:block" />
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                className={`group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all sm:px-3.5 ${active ? "border-lime/20 bg-lime/[.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.05)]" : "border-transparent text-muted hover:border-white/10 hover:bg-white/[.045] hover:text-white"}`}>
                <link.icon size={14} className={active ? "text-lime" : "text-dim group-hover:text-white"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link href="/studio" className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[.055] px-3.5 py-2 text-[11px] font-semibold text-white/85 transition hover:border-lime/25 hover:bg-white/[.08] sm:inline-flex">
          <Zap size={13} className="text-lime" /> Workspace
        </Link>
      </div>
    </header>
  );
}
