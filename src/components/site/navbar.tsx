"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "/#features" },
  { label: "Models", href: "/#models" },
  { label: "Process", href: "/#process" },
  { label: "Credits", href: "/credits" },
  { label: "FAQ", href: "/#faq" }
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-swift",
        scrolled
          ? "border-b border-line bg-ink/70 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,.35)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="site-container flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="NEXORA home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-medium text-muted transition-colors duration-200 hover:bg-white/5 hover:text-white",
                pathname === link.href && "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link href="/sign-in" className="btn-ghost">
            Sign in
          </Link>
          <Link href="/studio" className="btn-primary !px-5 !py-2.5 text-[13px]">
            Open Studio <ArrowUpRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-ink/95 backdrop-blur-xl transition-[max-height,opacity] duration-400 ease-swift lg:hidden",
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="site-container flex flex-col gap-1 py-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2.5">
            <Link href="/sign-in" onClick={() => setOpen(false)} className="btn-secondary w-full">
              Sign in
            </Link>
            <Link href="/studio" onClick={() => setOpen(false)} className="btn-primary w-full">
              Open Studio <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
