"use client";

/**
 * NEXORA motion primitives — powered by framer-motion (motiondivision) and
 * ola (franciscop). Every animation is cheap (transform/opacity only) and
 * respects prefers-reduced-motion, so the site stays fast and accessible.
 */

import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import ola from "ola";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------- scroll reveal ---------------------------- */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------- stagger -------------------------------- */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/* ------------------------------ kinetic heading --------------------------- */
export function KineticWords({
  words,
  className,
  wordClassName,
}: {
  words: string[];
  className?: string;
  wordClassName?: string;
}) {
  return (
    <span className={className} aria-label={words.join(" ")}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden
          className={`inline-block ${wordClassName ?? ""}`}
          initial={{ opacity: 0, y: 22, rotateX: 40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, delay: 0.08 * index, ease: EASE }}
          style={{ transformOrigin: "50% 100%" }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------ magnetic button --------------------------- */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    const rect = node.getBoundingClientRect();
    setOffset({
      x: (event.clientX - (rect.left + rect.width / 2)) * 0.18,
      y: (event.clientY - (rect.top + rect.height / 2)) * 0.28,
    });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- animated counter --------------------------- */
export function AnimatedCounter({
  value,
  durationMs = 900,
  className,
  suffix,
}: {
  value: number;
  durationMs?: number;
  className?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const interpolated = ola({ v: 0 }, durationMs);
    interpolated.v = value;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setDisplay(Math.round(interpolated.v));
      if (now - startedAt < durationMs + 80) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------ scroll progress --------------------------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 22, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #a3e635, #4ade80, #22d3ee)",
      }}
    />
  );
}

/* -------------------------------- hover lift ------------------------------ */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={prefersReducedMotion() ? undefined : { y: -4, transition: { duration: 0.22, ease: EASE } }}
    >
      {children}
    </motion.div>
  );
}
