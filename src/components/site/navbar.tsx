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

/** Tool-first header. No marketing links — every item is a working tool. */
export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="NEXORA studio">
          <Logo />
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none" aria-label="Tools">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                  active ? "bg-white/[0.06] text-white" : "text-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <link.icon size={13} className={active ? "text-lime" : "text-dim"} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="btn-primary hidden !px-4 !py-2 text-xs sm:inline-flex">
          Open studio
        </Link>
      </div>
    </header>
  );
}
