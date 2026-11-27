import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Studio", href: "/studio" },
      { label: "Credits", href: "/credits" },
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#process" }
    ]
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/sign-in" },
      { label: "How credits work", href: "/credits" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div aria-hidden className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet/50 to-transparent" />
      <div className="site-container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              A creation studio built on real generative models, durable jobs, and private storage.
              Every asset you make is auditable and yours.
            </p>
            <div className="mt-6">
              <span className="pill-live">
                <span className="dot-live" /> All systems operational
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dim">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="divider mt-14" />
        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-dim sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} NEXORA — Create without limits.</p>
          <p className="flex items-center gap-2">
            Real models. Real work.
            <span className="h-1 w-1 rounded-full bg-white/20" />
            No placeholders.
          </p>
        </div>
      </div>
    </footer>
  );
}
