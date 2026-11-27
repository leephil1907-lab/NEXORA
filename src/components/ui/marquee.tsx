import { cn } from "@/lib/utils";

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={cn("relative overflow-hidden border-y border-line py-5", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-ink to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-white/40">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet to-cyan" />
          </span>
        ))}
      </div>
    </div>
  );
}
