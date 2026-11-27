"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, RefreshCcw, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const rows = [
  { label: "Image generation", detail: "Any image model · professional mode ×2", value: "1 credit" },
  { label: "Video · 5 seconds", detail: "Wan 2.2/2.5, LTX-Video · professional ×2", value: "10 credits" },
  { label: "Video · 10 seconds", detail: "Wan 2.5, LTX-Video · professional ×2", value: "20 credits" },
  { label: "Clip extension · +5s", detail: "LTX-Video distilled continuation jobs", value: "10 credits" },
  { label: "Failed generations", detail: "Automatic refund to your balance", value: "Free" },
];

const principles = [
  {
    icon: Zap,
    title: "Reserved, then spent",
    body: "Credits are reserved the moment a job is submitted and only spent when the provider accepts the run. Insufficient balance blocks the run with a clear error — never a surprise deduction.",
  },
  {
    icon: RefreshCcw,
    title: "Automatic refunds",
    body: "If a provider fails, times out, or returns unusable media, the reservation is refunded to your balance and the failure is recorded on the job with a reason.",
  },
  {
    icon: ShieldCheck,
    title: "Auditable ledger",
    body: "Every reservation, deduction and refund writes a timestamped, reason-tagged entry. Support can reconcile any run by its job ID.",
  },
];

const faqs = [
  {
    q: "How do I get credits?",
    a: "Credits are granted by the deployment operator (onboarding grants, promotions, support adjustments). This deployment intentionally runs no payment processor — if purchases are enabled later, they will be real, verified transactions that add credits only after confirmation.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits sit on your balance until you spend them.",
  },
  {
    q: "What if a generation fails halfway?",
    a: "You are not charged for failed work. The reservation is refunded automatically and the job keeps the failure reason so you can retry with adjusted settings.",
  },
  {
    q: "Why does professional mode cost double?",
    a: "Professional mode maps to more inference steps / higher-quality samplers on the provider side (for example 50 denoising steps instead of 30 on LTX, or go_fast off on Wan). You pay for the extra compute you actually use.",
  },
];

export function CreditsPage() {
  return (
    <>
      <section className="site-container pt-36">
        <Reveal className="max-w-3xl">
          <span className="eyebrow"><span className="eyebrow-line" /> Credit economics</span>
          <h1 className="mt-5 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            Every credit, <span className="gradient-text">accounted for.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            NEXORA runs on real GPU inference, so usage is metered honestly. One number
            rules everything: what a run costs is what it deducts — and failed work is
            always free.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/studio" className="btn-primary">
              Open the Studio <ArrowUpRight size={17} />
            </Link>
            <Link href="/#faq" className="btn-secondary">Read the FAQ</Link>
          </div>
        </Reveal>
      </section>

      <section className="site-container py-20">
        <Reveal className="glass-strong overflow-hidden rounded-[2rem]">
          <div className="border-b border-line px-8 py-6">
            <h2 className="font-display text-xl font-semibold text-white/95">The rate card</h2>
            <p className="mt-1.5 text-sm text-muted">
              Effective costs for every action in the studio. The exact figure is displayed
              on the Generate button before you commit.
            </p>
          </div>
          <div className="divide-y divide-line/70">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
                <div>
                  <p className="text-sm font-semibold text-white/90">{row.label}</p>
                  <p className="mt-1 text-xs text-dim">{row.detail}</p>
                </div>
                <p className="font-display text-lg font-bold text-white">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-line bg-white/[0.02] px-8 py-5 text-xs leading-relaxed text-dim">
            Credits are granted by your operator — this deployment runs no payment processor.
            Existing balances remain fully usable, and every transaction is visible in your
            studio credit panel.
          </div>
        </Reveal>
      </section>

      <section className="site-container pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item, index) => (
            <Reveal key={item.title} delay={index * 120} className="glass-strong rounded-[1.75rem] p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet/12 text-violet">
                <item.icon size={21} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-white/95">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="site-container pb-28">
        <Reveal className="text-center">
          <span className="eyebrow"><span className="eyebrow-line" /> Questions</span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Billing questions, <span className="gradient-text">answered.</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {faqs.map((item, index) => (
            <Reveal key={item.q} delay={index * 100} className="glass-strong rounded-2xl p-6">
              <p className="flex items-start gap-3 text-sm font-semibold text-white/90">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-mint" /> {item.q}
              </p>
              <p className="mt-3 pl-7 text-sm leading-relaxed text-muted">{item.a}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
