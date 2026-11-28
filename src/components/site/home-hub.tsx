"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight, Clapperboard, Crown, Image as ImageIcon, MessageSquareText,
  Play, Sparkles, UserRound, Video, WandSparkles, Zap
} from "lucide-react";
import { TOOLS, getTool } from "@/lib/tools/registry";

/* --------------------------- 18+ confirm gate --------------------------- */
function AgeConfirmGate() {
  const [open, setOpen] = useState(false);
  const [age, setAge] = useState(false);
  const [responsibility, setResponsibility] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem("nexora-age-confirmed")) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5">
      <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lime/15 text-lime">
          <Sparkles size={20} />
        </span>
        <h2 className="mt-5 font-display text-xl font-extrabold text-white">Welcome to NEXORA</h2>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">Please confirm before entering</p>
        <div className="mt-5 space-y-2.5 text-left">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-xs text-muted">
            <input type="checkbox" checked={age} onChange={(event) => setAge(event.target.checked)} className="mt-0.5" />
            I am at least 18 years old and of legal age in my jurisdiction.
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-xs text-muted">
            <input type="checkbox" checked={responsibility} onChange={(event) => setResponsibility(event.target.checked)} className="mt-0.5" />
            I take full responsibility for the images and videos I generate.
          </label>
        </div>
        <button
          type="button"
          disabled={!age || !responsibility}
          onClick={() => {
            try { window.localStorage.setItem("nexora-age-confirmed", "1"); } catch { /* continue */ }
            setOpen(false);
          }}
          className="btn-primary mt-5 w-full !py-3"
        >
          Continue
        </button>
        <p className="mt-4 text-[10px] text-dim">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="text-cyan hover:underline">Terms of Service</Link> and{" "}
          <Link href="/legal/privacy" className="text-cyan hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- tool card ------------------------------ */
function ToolCard({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  const Icon = tool.category === "Images" ? ImageIcon : Clapperboard;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-panel p-5 transition-colors duration-200 hover:border-lime/35"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime/12 text-lime">
          <Icon size={19} />
        </span>
        <div className="flex items-center gap-1.5">
          {tool.badge && (
            <span className="rounded-full border border-lime/25 bg-lime/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-lime">
              {tool.badge}
            </span>
          )}
          <span className="rounded-full border border-line px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-dim">
            {tool.tag}
          </span>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{tool.name}</h3>
      <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-muted">{tool.desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-lime">
        Open tool <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

/* --------------------------------- home hub ------------------------------ */
export function HomeHub() {
  const imageTools = TOOLS.filter((tool) => tool.category === "Images");
  const videoTools = TOOLS.filter((tool) => tool.category === "Video");
  const spotlight = getTool("video-audio-studio");

  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 pb-14">
      <AgeConfirmGate />

      {/* -------------------------------- hero ------------------------------ */}
      <section className="mt-8 overflow-hidden rounded-[2rem] border border-line bg-panel p-8 sm:p-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-rose/30 bg-rose/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-rose">18+ adults only</span>
          <span className="rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-lime">Real engines · no placeholders</span>
        </div>
        <h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
          NSFW AI Image & <span className="gradient-text">Video Studio</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          Advanced generation tools for consenting adults — image creation, editing, pose control,
          cinematic video and native sound, all powered by real model engines.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/studio" className="btn-primary !px-6 !py-3.5 text-sm">
            Open the studio <ArrowUpRight size={16} />
          </Link>
          <Link href="/tools" className="btn-secondary !px-6 !py-3.5 text-sm">Browse creative tools</Link>
        </div>
      </section>

      {/* ----------------------------- spotlight ---------------------------- */}
      {spotlight && (
        <section className="mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-lime">In the spotlight</p>
          <div className="mt-3 flex flex-col gap-6 rounded-[2rem] border border-line bg-panel p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan/25 bg-cyan/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan">Native sound</span>
                <span className="rounded-full border border-line px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-dim">Video</span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">{spotlight.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{spotlight.desc}</p>
              <Link href={`/tools/${spotlight.slug}`} className="btn-primary mt-6 inline-flex !px-5 !py-3 text-xs">
                Start creating <Play size={14} />
              </Link>
            </div>
            <div className="grid w-full max-w-sm shrink-0 grid-cols-2 gap-3">
              {["Image in", "Motion", "Sound", "One video"].map((label, index) => (
                <div key={label} className="rounded-2xl border border-line bg-white/[0.02] p-4">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime/12 text-lime">
                    {index === 0 ? <ImageIcon size={14} /> : index === 1 ? <Video size={14} /> : index === 2 ? <Zap size={14} /> : <Sparkles size={14} />}
                  </span>
                  <p className="mt-2.5 text-[11px] font-semibold text-white/85">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------- image tools --------------------------- */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <ImageIcon size={17} className="text-lime" /> AI Image Tools
            </h2>
            <p className="mt-1 text-[11px] text-dim">{imageTools.length} to explore</p>
          </div>
          <Link href="/tools" className="text-[11px] font-semibold text-cyan hover:underline">View all tools</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imageTools.map((tool) => <ToolCard key={tool.slug} slug={tool.slug} />)}
        </div>
      </section>

      {/* ---------------------------- video tools --------------------------- */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Clapperboard size={17} className="text-lime" /> AI Video Tools
            </h2>
            <p className="mt-1 text-[11px] text-dim">{videoTools.length} to explore</p>
          </div>
          <Link href="/tools" className="text-[11px] font-semibold text-cyan hover:underline">View all tools</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videoTools.map((tool) => <ToolCard key={tool.slug} slug={tool.slug} />)}
        </div>
      </section>

      {/* ----------------------------- upgrade strip ------------------------ */}
      <section className="mt-10">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] border border-line bg-panel p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lime/30 to-cyan/20 text-lime">
              <Crown size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-white">Upgrade now</h2>
              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted">
                More credits, professional mode, and priority on every generation. Credits are consumed
                only on real runs and refunded automatically on failure.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/credits" className="btn-primary !px-5 !py-3 text-xs">See credit plans</Link>
            <Link href="/chat" className="btn-secondary inline-flex items-center gap-1.5 !px-5 !py-3 text-xs">
              <MessageSquareText size={13} /> Chat
            </Link>
            <Link href="/profile" className="btn-secondary inline-flex items-center gap-1.5 !px-5 !py-3 text-xs">
              <UserRound size={13} /> Profile
            </Link>
            <Link href="/tasks" className="btn-secondary inline-flex items-center gap-1.5 !px-5 !py-3 text-xs">
              <WandSparkles size={13} /> Tasks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
