import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("h-9 w-9", className)} aria-hidden>
      <defs>
        <linearGradient id="nexora-mark" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" />
          <stop offset="0.5" stopColor="#7de3f4" />
          <stop offset="1" stopColor="#f0abfc" />
        </linearGradient>
        <linearGradient id="nexora-core" x1="18" y1="16" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e9d5ff" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      {/* Hexagonal prism aperture */}
      <path
        d="M24 2.8 42.2 13.4v21.2L24 45.2 5.8 34.6V13.4L24 2.8Z"
        stroke="url(#nexora-mark)"
        strokeOpacity="0.6"
        strokeWidth="1.7"
        fill="rgba(255,255,255,0.03)"
      />
      <path
        d="M24 9.6 36.3 16.8v14.4L24 38.4 11.7 31.2V16.8L24 9.6Z"
        stroke="url(#nexora-mark)"
        strokeOpacity="0.35"
        strokeWidth="1"
        fill="none"
      />
      {/* Stylised N cut through the core */}
      <path
        d="M19 29.4V18.6l10 10.8V18.6"
        stroke="url(#nexora-core)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          NEXORA<span className="gradient-text"> AI</span>
        </span>
      )}
    </span>
  );
}
