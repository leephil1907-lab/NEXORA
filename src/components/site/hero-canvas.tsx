"use client";

/**
 * Hero ambient canvas — animated with anime.js (juliangarnier/anime.js).
 * Crisp line-art motion behind the hero: flowing paths, drifting rings,
 * floating nodes. No blur, no WebGL, transform/opacity only, and fully
 * disabled under prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "./motion";

export function HeroCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || prefersReducedMotion()) return;

    const shapes = svg.querySelectorAll<SVGElement>(".hero-shape");
    const lines = svg.querySelectorAll<SVGPathElement>(".hero-line");
    const nodes = svg.querySelectorAll<SVGElement>(".hero-node");

    const drift = animate(shapes, {
      translateX: [-6, 6],
      translateY: [-10, 10],
      opacity: [0.35, 0.85],
      loop: true,
      alternate: true,
      ease: "inOutSine",
      duration: 3600,
      delay: stagger(260),
    });

    const flow = animate(lines, {
      strokeDashoffset: [240, 0],
      opacity: [0.18, 0.6],
      loop: true,
      alternate: true,
      ease: "inOutQuad",
      duration: 4600,
      delay: stagger(180),
    });

    const pulse = animate(nodes, {
      scale: [0.7, 1.15],
      opacity: [0.25, 0.9],
      loop: true,
      alternate: true,
      ease: "inOutSine",
      duration: 2800,
      delay: stagger(140),
    });

    return () => {
      drift.pause();
      flow.pause();
      pulse.pause();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="hero-line-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* flowing line-art */}
      <path className="hero-line" d="M-40 480 C 220 380, 380 560, 640 440 S 1020 300, 1260 380" fill="none" stroke="url(#hero-line-grad)" strokeWidth="1.5" strokeDasharray="10 14" opacity="0.35" />
      <path className="hero-line" d="M-40 540 C 260 460, 420 620, 700 500 S 1040 380, 1260 440" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="8 16" opacity="0.25" />
      <path className="hero-line" d="M-40 420 C 200 320, 420 480, 660 360 S 1000 220, 1260 300" fill="none" stroke="#a3e635" strokeWidth="1" strokeDasharray="6 18" opacity="0.22" />

      {/* drifting rings */}
      <g className="hero-shape" opacity="0.5">
        <circle cx="1035" cy="155" r="72" fill="none" stroke="#a3e635" strokeWidth="1.2" strokeDasharray="5 11" />
        <circle cx="1035" cy="155" r="112" fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="3 13" opacity="0.6" />
      </g>
      <g className="hero-shape" opacity="0.45">
        <rect x="148" y="96" width="104" height="104" rx="26" fill="none" stroke="#22d3ee" strokeWidth="1.1" strokeDasharray="6 12" transform="rotate(12 200 148)" />
      </g>
      <g className="hero-shape" opacity="0.4">
        <rect x="884" y="392" width="140" height="140" rx="36" fill="none" stroke="#a3e635" strokeWidth="1" strokeDasharray="4 12" transform="rotate(-8 954 462)" />
      </g>
      <g className="hero-shape" opacity="0.4">
        <polygon points="330,240 372,314 288,314" fill="none" stroke="#4ade80" strokeWidth="1.1" strokeDasharray="5 10" />
      </g>

      {/* floating nodes */}
      <circle className="hero-node" cx="480" cy="120" r="3.5" fill="#a3e635" />
      <circle className="hero-node" cx="720" cy="220" r="3" fill="#22d3ee" />
      <circle className="hero-node" cx="240" cy="360" r="3" fill="#4ade80" />
      <circle className="hero-node" cx="920" cy="300" r="3.5" fill="#22d3ee" />
      <circle className="hero-node" cx="600" cy="520" r="3" fill="#a3e635" />
      <circle className="hero-node" cx="1100" cy="480" r="3" fill="#4ade80" />
    </svg>
  );
}
