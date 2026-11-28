"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Boxes, Check, Clapperboard, Flame, Image as ImageIcon,
  Layers, Minus, Play, Plus, ShieldAlert, Sparkles, Wand2, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AnimatedCounter, HoverLift, KineticWords, Magnetic, Reveal, StaggerGroup, StaggerItem,
} from "@/components/site/motion";
import { TEMPLATES } from "@/lib/tools/templates";

const HeroCanvas = dynamic(
  () => import("@/components/site/hero-canvas").then((module) => module.HeroCanvas),
  { ssr: false }
);

const AGE_KEY = "nexora-age-gate";

type AgeGate = { over18: boolean; respect: boolean; time: string };

function readAgeGate(): AgeGate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AGE_KEY);
    return raw ? (JSON.parse(raw) as AgeGate) : null;
  } catch {
    return null;
  }
}

function AgeGateOverlay() {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);
  const [over18, setOver18] = useState(false);
  const [respect, setRespect] = useState(false);

  useEffect(() => {
    setReady(true);
    setShow(!readAgeGate());
  }, []);

  if (!ready || !show) return null;

  const canEnter = over18 && respect;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/[0.82] p-5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[1.75rem] border border-lime/25 bg-[#0d1424] p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-lime/30 bg-lime/15 text-lime">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-white">
              Confirm you&apos;re 18+
            </h2>
            <p className="text-xs text-muted">NEXORA hosts adult-creative tools and content.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setOver18((value) => !value)}
            className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 ${
              over18 ? "border-lime/40 bg-lime/10" : "border-line bg-white/[0.02] hover:border-white/15"
            }`}
          >
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${over18 ? "border-lime bg-lime text-ink" : "border-white/15 text-transparent"}`}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-sm font-medium text-white">I confirm that I am 18 years or older.</span>
          </button>

          <button
            type="button"
            onClick={() => setRespect((value) => !value)}
            className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 ${
              respect ? "border-lime/40 bg-lime/10" : "border-line bg-white/[0.02] hover:border-white/15"
            }`}
          >
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${respect ? "border-lime bg-lime text-ink" : "border-white/15 text-transparent"}`}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-sm font-medium text-white">I agree to follow the rules and use the platform respectfully.</span>
          </button>
        </div>

        <button
          type="button"
          disabled={!canEnter}
          onClick={() => {
            window.localStorage.setItem(AGE_KEY, JSON.stringify({ over18: true, respect: true, time: new Date().toISOString() }));
            setShow(false);
          }}
          className={`btn-primary mt-6 h-12 w-full text-sm ${!canEnter ? "cursor-not-allowed opacity-40" : ""}`}
        >
          Continue to NEXORA
        </button>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-dim">
          By entering, you confirm you&apos;re 18+ and agree to use the platform respectfully.{" "}
          <Link href="/legal/terms" className="text-lime/80 hover:text-lime">Terms</Link> ·{" "}
          <Link href="/legal/privacy" className="text-lime/80 hover:text-lime">Privacy</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

type ToolCard = {
  slug: string;
  name: string;
  description: string;
  icon: typeof Boxes;
  badge?: { label: string; tone: "lime" | "cyan" | "amber" };
};

const IMAGE_TOOLS: ToolCard[] = [
  {
    slug: "text-to-image",
    name: "Text-to-Image",
    description: "Create a new image from a prompt with the connected Gemini image engine.",
    icon: Wand2,
    badge: { label: "New", tone: "lime" },
  },
  {
    slug: "image-editor",
    name: "Image Editor",
    description: "Upload a reference image and edit it with natural-language instructions.",
    icon: ImageIcon,
    badge: { label: "Reference", tone: "cyan" },
  },
];

const VIDEO_TOOLS: ToolCard[] = [
  {
    slug: "text-to-video",
    name: "Text-to-Video",
    description: "Generate a video clip from a written scene description.",
    icon: Clapperboard,
  },
  {
    slug: "image-to-video",
    name: "Image-to-Video",
    description: "Animate an uploaded or generated still image.",
    icon: Play,
    badge: { label: "Popular", tone: "amber" },
  },
];

const BADGE_TONES = {
  lime: "border-lime/30 bg-lime/15 text-lime",
  cyan: "border-cyan/30 bg-cyan/15 text-cyan",
  amber: "border-amber/30 bg-amber/15 text-amber",
} as const;

const STRIP_TONES = {
  lime: "border-lime/25 bg-lime/10 text-lime",
  cyan: "border-cyan/25 bg-cyan/10 text-cyan",
  amber: "border-amber/25 bg-amber/10 text-amber",
} as const;

function ToolCardGrid({ tools }: { tools: ToolCard[] }) {
  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <StaggerItem key={tool.slug}>
          <HoverLift>
            <Link
              href={`/tools/${tool.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-5 transition-colors duration-200 hover:border-lime/35"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-lime transition-colors duration-200 group-hover:border-lime/30 group-hover:bg-lime/10">
                  <tool.icon size={18} />
                </div>
                {tool.badge && (
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${BADGE_TONES[tool.badge.tone]}`}>
                    {tool.badge.label}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{tool.name}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-lime">
                Open tool
                <ArrowUpRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </HoverLift>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function TemplatesRail() {
  const presets = TEMPLATES.slice(0, 4);
  return (
    <section className="pt-10">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Layers size={18} className="text-lime" /> Templates
            </h2>
            <p className="mt-1 text-sm text-muted">Prompt presets that open real tools — ready to generate.</p>
          </div>
          <Link href="/templates" className="btn-ghost h-9 px-4 text-[11px]">
            Browse all templates <ArrowRight size={13} />
          </Link>
        </div>
      </Reveal>
      <StaggerGroup className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {presets.map((template) => (
          <StaggerItem key={template.id}>
            <HoverLift>
              <Link
                href={`/tools/${template.tool}?prompt=${encodeURIComponent(template.prompt)}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-5 transition-colors duration-200 hover:border-lime/35"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">
                    {template.category}
                  </span>
                  {template.badge && (
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${BADGE_TONES[template.badge === "Hot" ? "amber" : template.badge === "Pro" ? "cyan" : "lime"]}`}>
                      {template.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-3.5 text-sm font-semibold text-white">{template.name}</h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted">{template.prompt}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-lime">
                  Try template
                  <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </HoverLift>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

export function HomeHub() {
  return (
    <>
      <AgeGateOverlay />
      <main className="mx-auto w-full max-w-[1400px] px-5 pb-14">

      {/* hero */}
      <section className="relative overflow-hidden rounded-[2.25rem] border border-line bg-panel">
        <div className="absolute inset-0 opacity-70">
          <HeroCanvas />
        </div>
        <div className="relative z-10 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-lime"
          >
            <Sparkles size={12} />
            NEXORA — AI creation platform for 18+
          </motion.p>

          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-[4.25rem] lg:leading-[1.04]">
            <KineticWords words={["Create", "without", "limits."]} />
            <span className="block">
              <KineticWords words={["Turn", "any", "idea", "into", "an", "image", "or", "video."]} wordClassName="gradient-text" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            Professional creative tools for images, video, reference editing, and cinematic motion —
            all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Link href="/tools" className="btn-primary h-12 px-6 text-sm">
                Start creating <ArrowRight size={15} />
              </Link>
            </Magnetic>
            <Link href="/templates" className="btn-ghost h-12 px-6 text-sm">
              Browse templates
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.06] pt-6"
          >
            {[
              { value: 8, label: "creative tools", suffix: "" },
              { value: 3, label: "image tools", suffix: "" },
              { value: 5, label: "video tools", suffix: "" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="font-display text-2xl font-extrabold text-lime sm:text-3xl"
                />
                <span className="text-xs uppercase tracking-[0.16em] text-muted">{stat.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-lime">
                <Zap size={12} />
              </span>
              18+ gated · real credits · live job tracking
            </div>
          </motion.div>
        </div>
      </section>

      {/* spotlight */}
      <Reveal className="mt-8">
        <Link
          href="/tools/image-to-video"
          className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-lime/25 bg-gradient-to-br from-lime/[0.12] via-green/[0.06] to-cyan/[0.10] p-7 transition-colors duration-200 hover:border-lime/45 sm:flex-row sm:items-center sm:gap-8 sm:p-9"
        >
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-lime/30 bg-lime/15 text-lime">
            <Play size={24} />
          </div>
          <div className="mt-5 flex-1 sm:mt-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-lime/30 bg-lime/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-lime">
                Spotlight
              </span>
              <span className="rounded-full border border-cyan/30 bg-cyan/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan">
                Image to video
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Image to Video</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Animate a generated or uploaded still image with a motion prompt, then follow the job through to its saved result.
            </p>
          </div>
          <span className="mt-6 inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-lime px-5 text-xs font-bold text-ink transition-transform duration-200 group-hover:translate-x-1 sm:mt-0 sm:self-center">
            Open tool <ArrowRight size={15} />
          </span>
        </Link>
      </Reveal>

      {/* image tools */}
      <Reveal className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <ImageIcon size={18} className="text-lime" /> AI Image Tools
            </h2>
            <p className="mt-1 text-sm text-muted">Create, edit and direct stills with real generation behind every tool.</p>
          </div>
          <Link href="/tools?kind=image" className="btn-ghost h-9 px-4 text-[11px]">
            View image tools <ArrowRight size={13} />
          </Link>
        </div>
      </Reveal>
      <div className="mt-5">
        <ToolCardGrid tools={IMAGE_TOOLS} />
      </div>

      {/* video tools */}
      <Reveal className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Clapperboard size={18} className="text-cyan" /> AI Video Tools
            </h2>
            <p className="mt-1 text-sm text-muted">Create clips from text or animate a still image, then track every generation.</p>
          </div>
          <Link href="/tools?kind=video" className="btn-ghost h-9 px-4 text-[11px]">
            View video tools <ArrowRight size={13} />
          </Link>
        </div>
      </Reveal>
      <div className="mt-5">
        <ToolCardGrid tools={VIDEO_TOOLS} />
      </div>

      {/* templates */}
      <TemplatesRail />

      {/* upgrade strip */}
      <Reveal className="mt-12">
        <section className="rounded-[1.75rem] border border-line bg-panel p-8 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                <Flame size={18} className="text-lime" /> Clear credit usage
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                See the estimated cost before every generation. Credits are reserved when a job starts and returned automatically when a run fails.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/credits" className="btn-primary h-11 px-5 text-xs">
                  View credit rules <ArrowRight size={14} />
                </Link>
                <Link href="/tasks" className="btn-ghost h-11 px-5 text-xs">
                  View my tasks
                </Link>
              </div>
            </div>

            <div className="grid gap-3 lg:w-[26rem]">
              {([
                { icon: Plus, value: "Reserved", label: "Credits before each generation", tone: "lime" },
                { icon: Zap, value: "Visible", label: "Cost before you submit", tone: "cyan" },
                { icon: Minus, value: "Refunded", label: "Failed generations return credits", tone: "amber" },
              ] as const).map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-3.5"
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-xl border ${STRIP_TONES[row.tone]}`}>
                    <row.icon size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{row.value}</p>
                    <p className="text-[10px] text-muted">{row.label}</p>
                  </div>
                  <Check size={14} className="text-lime" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
      </main>
    </>
  );
}
