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
import { TOOLS } from "@/lib/tools/registry";

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
  const [category, setCategory] = useState<"All" | "Images" | "Video">("All");
  const visibleTools = TOOLS.filter((tool) => category === "All" || tool.category === category);
  const cards: ToolCard[] = visibleTools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    description: tool.desc,
    icon: tool.category === "Images" ? ImageIcon : Clapperboard,
    badge: tool.badge ? {
      label: tool.badge,
      tone: tool.badge === "Hot" ? "amber" : tool.badge === "Pro" ? "cyan" : "lime",
    } : undefined,
  }));

  return (
    <>
      <AgeGateOverlay />
      <main className="mx-auto w-full max-w-[1480px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-line bg-[#101827]">
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-cyan/10 blur-3xl" />
          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:p-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-lime">
                <Sparkles size={12} /> NEXORA creative studio
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
                Your ideas.
                <span className="block gradient-text">Made visual.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                Create images, transform references and bring stills to life. Start with a focused tool,
                then manage every result in your personal creative library.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/studio" className="btn-primary h-11 px-5 text-xs">
                  <Wand2 size={14} /> Open creative studio <ArrowRight size={14} />
                </Link>
                <Link href="/tasks" className="btn-ghost h-11 px-5 text-xs">
                  <Layers size={14} /> My creations
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/tools/text-to-image" className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 transition hover:border-lime/30 hover:bg-white/[.07]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime/10 text-lime"><ImageIcon size={18}/></span>
                <p className="mt-4 text-xs font-semibold text-white">Create an image</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">Start from a prompt</p>
                <ArrowUpRight size={14} className="mt-4 text-lime transition-transform group-hover:translate-x-1"/>
              </Link>
              <Link href="/tools/image-editor" className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 transition hover:border-lime/30 hover:bg-white/[.07]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/10 text-cyan"><Wand2 size={18}/></span>
                <p className="mt-4 text-xs font-semibold text-white">Edit an image</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">Transform a reference</p>
                <ArrowUpRight size={14} className="mt-4 text-lime transition-transform group-hover:translate-x-1"/>
              </Link>
              <Link href="/tools/text-to-video" className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 transition hover:border-lime/30 hover:bg-white/[.07]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/10 text-cyan"><Clapperboard size={18}/></span>
                <p className="mt-4 text-xs font-semibold text-white">Create a video</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">Generate from text</p>
                <ArrowUpRight size={14} className="mt-4 text-lime transition-transform group-hover:translate-x-1"/>
              </Link>
              <Link href="/tools/image-to-video" className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 transition hover:border-lime/30 hover:bg-white/[.07]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber/10 text-amber"><Play size={18}/></span>
                <p className="mt-4 text-xs font-semibold text-white">Animate a still</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">Image to video</p>
                <ArrowUpRight size={14} className="mt-4 text-lime transition-transform group-hover:translate-x-1"/>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-lime">Explore NEXORA</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Choose your creative tool</h2>
              <p className="mt-1.5 text-xs text-muted">Each tool opens its own focused workflow. No model picker or extra setup.</p>
            </div>
            <div className="flex gap-1.5 rounded-xl border border-line bg-panel p-1">
              {(["All", "Images", "Video"] as const).map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
                  className={category === item ? "rounded-lg bg-lime/15 px-3.5 py-2 text-[10px] font-semibold text-lime" : "rounded-lg px-3.5 py-2 text-[10px] font-semibold text-muted transition hover:text-white"}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5"><ToolCardGrid tools={cards} /></div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { href: "/characters", label: "Characters", detail: "Manage reusable character references.", icon: Sparkles },
            { href: "/cases", label: "Creation cases", detail: "Explore reusable creative briefs.", icon: Layers },
            { href: "/workflows", label: "Workflows", detail: "Organize repeatable creation steps.", icon: Boxes },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group flex items-center gap-4 rounded-2xl border border-line bg-panel p-5 transition hover:border-lime/30">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-lime"><item.icon size={18}/></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{item.label}</span><span className="mt-1 block text-[10px] text-muted">{item.detail}</span></span>
              <ArrowUpRight size={15} className="text-dim transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"/>
            </Link>
          ))}
        </section>

        <TemplatesRail />

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-panel px-5 py-5 sm:px-7">
          <div>
            <p className="text-sm font-semibold text-white">Your creative history stays in one place.</p>
            <p className="mt-1 text-[11px] text-muted">Track active jobs, revisit finished images and videos, and download your work.</p>
          </div>
          <Link href="/tasks" className="btn-secondary h-10 px-4 text-xs">Open task history <ArrowRight size={13}/></Link>
        </section>
      </main>
    </>
  );
}
