"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Scroll-reveal wrapper. Content is visible by default; JavaScript only adds the
 * hidden "pending" state to elements below the fold, then animates them in when
 * they are reached. If anything is skipped (fast scrollbar drags, anchor jumps,
 * screenshots), a sweep reveals it immediately. Without JavaScript, all content
 * simply stays visible.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = (target: Element) => {
      target.classList.remove("reveal-pending");
      target.classList.add("is-visible");
      observer.unobserve(target);
    };

    // Only elements below the fold get the hidden state — everything else
    // renders at full opacity from the start (no flash, no blank states).
    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) {
      node.classList.add("is-visible");
      return;
    }
    node.classList.add("reveal-pending");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);

    // Safety net: fast scrollbar drags and anchor jumps can skip the observer's
    // intersection window entirely. Anything already at or above the reveal line
    // is made visible immediately.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      if (node.getBoundingClientRect().top < window.innerHeight * 0.94) {
        show(node);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    sweep();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
