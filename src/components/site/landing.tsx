"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Boxes, CheckCircle2, Cpu, CreditCard, FileClock,
  Film, Image as ImageIcon, KeyRound, Layers, Play, ShieldCheck,
  Sparkles, WandSparkles, Zap
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Marquee } from "@/components/ui/marquee";
import { Accordion, type FaqItem } from "@/components/ui/accordion";
import { NexoraScene } from "@/components/site/nexora-scene";
import { cn } from "@/lib/utils";

/* ---------------------------------- hero ---------------------------------- */

function HeroOrb() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      {/* orbit rings */}
      <div className="absolute inset-[8%] rounded-full border border-violet/20 animate-spin-slow" />
      <div className="absolute inset-[18%] rounded-full border border-cyan/15" style={{ transform: "rotate(18deg) scaleY(.62)" }} />
      <div className="absolute inset-[18%] rounded-full border border-magenta/15" style={{ transform: "rotate(-30deg) scaleY(.55)" }} />

      {/* core: CSS glow underlay (no-WebGL fallback) */}
      <div className="absolute inset-[26%] rounded-full"
        style={{ background: "radial-gradient(circle at 32% 28%, rgba(196,181,253,.95), rgba(124,92,255,.55) 42%, rgba(34,211,238,.28) 75%, transparent)", boxShadow: "0 0 120px rgba(139,92,246,.55), inset 0 0 60px rgba(255,255,255,.18)" }} />
      {/* live WebGL crystal core */}
      <div className="absolute inset-[12%] overflow-hidden rounded-full">
        <NexoraScene />
      </div>
      <div className="absolute inset-[36%] rounded-full bg-ink/25 backdrop-blur-[2px]" />
      <div className="absolute inset-[41%] grid place-items-center rounded-full border border-white/15">
        <Sparkles size={26} className="text-white/90" />
      </div>

      {/* floating chips */}
      <div className="absolute left-0 top-[12%] glass-strong rounded-2xl px-4 py-3 animate-float">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet/15 text-violet"><ImageIcon size={15} /></span>
          <div>
            <p className="text-[11px] font-semibold text-white/90">Image synthesis</p>
            <p className="text-[10px] text-dim">1:1 · 3:2 · 16:9 · 9:16</p>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-[38%] glass-strong rounded-2xl px-4 py-3 animate-float" style={{ animationDelay: "1.4s" }}>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan/15 text-cyan"><Film size={15} /></span>
          <div>
            <p className="text-[11px] font-semibold text-white/90">Cinematic video</p>
            <p className="text-[10px] text-dim">Motion, shot &amp; story</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[8%] left-[14%] glass-strong rounded-2xl px-4 py-3 animate-float" style={{ animationDelay: "2.6s" }}>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint/15 text-mint"><ShieldCheck size={15} /></span>
          <div>
            <p className="text-[11px] font-semibold text-white/90">Private storage</p>
            <p className="text-[10px] text-dim">Signed, expiring access</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroPromptBar() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = prompt.trim();
    if (value.length < 3) return;
    router.push(`/studio?prompt=${encodeURIComponent(value.slice(0, 3000))}`);
  }

  return (
    <form onSubmit={submit} className="glass-strong mt-9 flex w-full max-w-xl flex-col gap-3 rounded-2xl p-2.5 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3 px-3">
        <WandSparkles size={17} className="shrink-0 text-violet" />
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={3000}
          placeholder="Describe anything — a portrait, a product, a world…"
          aria-label="Describe your idea"
          className="h-11 w-full bg-transparent text-sm text-white placeholder:text-dim focus:outline-none"
        />
      </div>
      <button type="submit" className="btn-primary whitespace-nowrap" disabled={prompt.trim().length < 3}>
        Create it <ArrowRight size={16} />
      </button>
    </form>
  );
}

function Hero() {
  return (
    <section className="relative pt-36 pb-20 sm:pt-44">
      <div className="site-container grid items-center gap-14 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <Reveal>
            <span className="pill border-violet/30 bg-violet/10 text-violet">
              <span className="dot-live" /> Real models · Real media · No placeholders
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-7 font-display text-[clamp(2.9rem,7vw,5.1rem)] font-extrabold leading-[1.02] tracking-tight">
              Create without
              <br />
              <span className="gradient-text text-shadow-glow">limits.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              NEXORA turns ideas into images and cinematic video through real generative
              models — orchestrated with durable jobs, transparent credits, and storage you
              actually own.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <HeroPromptBar />
          </Reveal>
          <Reveal delay={330}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-dim">
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-mint" /> Passwordless sign-in</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-mint" /> Private per-user storage</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-mint" /> Automatic failure refunds</span>
            </div>
          </Reveal>
        </div>
        <Reveal delay={220} className="hidden lg:block">
          <HeroOrb />
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- marquee --------------------------------- */

const marqueeItems = [
  "Text to image",
  "Cinematic video",
  "Reference guided",
  "Auditable jobs",
  "Private storage",
  "Credit billing",
  "Aspect precise",
  "Production ready"
];

/* -------------------------------- showcase -------------------------------- */

const formats = [
  { ratio: "1:1", label: "Square", desc: "Editorial & social", className: "aspect-square", gradient: "from-violet/40 via-cyan/20 to-transparent" },
  { ratio: "16:9", label: "Widescreen", desc: "Cinematic & video", className: "aspect-video", gradient: "from-cyan/35 via-violet/20 to-magenta/15" },
  { ratio: "9:16", label: "Vertical", desc: "Stories & reels", className: "aspect-[9/16]", gradient: "from-magenta/35 via-violet/20 to-transparent" },
  { ratio: "3:2", label: "Classic", desc: "Photography native", className: "aspect-[3/2]", gradient: "from-violet/30 via-magenta/15 to-cyan/20" }
];

function Showcase() {
  return (
    <section id="models" className="site-container scroll-mt-28 py-24">
      <Reveal className="max-w-2xl">
        <span className="eyebrow"><span className="eyebrow-line" /> Model roster</span>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Every frame. <span className="gradient-text">Every format.</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Compose once, deliver anywhere. NEXORA runs real open models on real GPUs —
          pick the engine that matches the shot, from fast drafts to cinematic masters.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Wan 2.2", tag: "T2V · I2V", note: "PrunaAI-optimized speed — 5s clips in about 40s.", by: "Alibaba Tongyi Lab" },
          { name: "Wan 2.5", tag: "A/V sync", note: "Up to 10s with synchronized audio and lip-sync.", by: "Alibaba Tongyi Lab" },
          { name: "LTX-Video", tag: "Real-time DiT", note: "Full parameter control — guidance, frames, seeds, extension.", by: "Lightricks" },
          { name: "FLUX.1 schnell", tag: "Stills", note: "Photorealistic images in seconds with native aspect control.", by: "Black Forest Labs" },
        ].map((model, index) => (
          <Reveal key={model.name} delay={index * 90}>
            <div className="glass-strong h-full rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-base font-semibold text-white/95">{model.name}</p>
                <span className="pill border-cyan/25 bg-cyan/10 text-cyan">{model.tag}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{model.note}</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-dim">{model.by}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={140}>
        <p className="mt-4 text-xs text-dim">
          Plus bring-your-own GPU endpoints (OpenAI-compatible) for self-hosted GGUF models —
          including the Inkling 2 Mini, Dongfangshuo Qwen3.8 and MOSS GGUF LoRA backends.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {formats.map((format, index) => (
          <Reveal key={format.ratio} delay={index * 90}>
            <div className="glass-strong card-hover overflow-hidden rounded-3xl">
              <div className={cn("relative w-full overflow-hidden", format.className)}>
                <div className={cn("absolute inset-0 bg-gradient-to-br", format.gradient)} />
                <div className="absolute inset-0 grid-lines opacity-60" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-display text-3xl font-extrabold text-white/85 drop-shadow-[0_0_24px_rgba(167,139,250,.6)]">
                    {format.ratio}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="font-display text-sm font-semibold text-white/90">{format.label}</p>
                <p className="mt-1 text-xs text-dim">{format.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="glass-strong mt-6 grid gap-6 rounded-3xl p-8 sm:grid-cols-3">
          {[
            { icon: ImageIcon, title: "Photoreal stills", copy: "Portraits, products, campaigns — with the fidelity of the underlying model." },
            { icon: Film, title: "Motion & story", copy: "Video jobs run through the same auditable pipeline as stills." },
            { icon: Layers, title: "Reference guided", copy: "Attach a reference image to steer composition, style and subject." }
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet/20 to-cyan/10 text-violet">
                <item.icon size={19} />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-white/90">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------- features -------------------------------- */

const features = [
  {
    icon: Cpu,
    title: "Real provider execution",
    copy: "Every job is a real inference request to a configured model API. Missing configuration returns an explicit error — never a simulated result."
  },
  {
    icon: FileClock,
    title: "Durable, auditable jobs",
    copy: "Each generation is a persisted record with ownership, provider state, timestamps and failure detail. Refresh freely — nothing is lost."
  },
  {
    icon: ShieldCheck,
    title: "Private object storage",
    copy: "Media is copied into per-user private storage and served through signed, expiring URLs. Nothing is public by default."
  },
  {
    icon: Boxes,
    title: "Reference-guided creation",
    copy: "Upload JPEG, PNG or WebP references up to 20 MB and steer the model toward your subject, palette or composition."
  },
  {
    icon: CreditCard,
    title: "Transparent credit billing",
    copy: "Credits are reserved transactionally before submission and refunded automatically when a generation fails. Every transaction writes a reason-tagged ledger entry."
  },
  {
    icon: KeyRound,
    title: "Server-enforced roles",
    copy: "Admin privileges and customer entitlements are checked server-side on every request. Secrets never reach the browser."
  }
];

function Features() {
  return (
    <section id="features" className="site-container scroll-mt-28 py-24">
      <Reveal className="max-w-2xl">
        <span className="eyebrow"><span className="eyebrow-line" /> The engine</span>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Built like production software,
          <br />
          <span className="gradient-text">not a demo.</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted">
          NEXORA is engineered around a simple principle: real work deserves real infrastructure.
          Everything below runs in the live product today.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 3) * 100}>
            <div className="glass-strong card-hover h-full rounded-3xl p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet/20 to-cyan/10 text-violet">
                <feature.icon size={21} />
              </span>
              <h3 className="mt-6 font-display text-lg font-semibold text-white/95">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{feature.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- process -------------------------------- */

const steps = [
  { n: "01", title: "Describe", copy: "Write your prompt, pick a format, and optionally attach a reference image." },
  { n: "02", title: "Generate", copy: "Credits are reserved and a real inference job is submitted to the configured model." },
  { n: "03", title: "Persist", copy: "Completed media is downloaded, verified and copied into your private storage." },
  { n: "04", title: "Own", copy: "Open, download and revisit every asset from your library — permanently." }
];

function Process() {
  return (
    <section id="process" className="site-container scroll-mt-28 py-24">
      <Reveal className="text-center">
        <span className="eyebrow"><span className="eyebrow-line" /> The flow</span>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          From thought to <span className="gradient-text">artifact.</span>
        </h2>
      </Reveal>

      <div className="relative mt-14">
        <div aria-hidden className="absolute left-0 right-0 top-[46px] hidden h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent lg:block" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.n} delay={index * 110}>
              <div className="relative">
                <div className="font-display text-sm font-bold tracking-[0.28em] text-violet">{step.n}</div>
                <div className="glass-strong mt-4 rounded-3xl p-6">
                  <h3 className="font-display text-lg font-semibold text-white/95">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- pricing -------------------------------- */

function PricingSection() {
  return (
    <section id="credits" className="site-container scroll-mt-28 py-24">
      <Reveal className="text-center">
        <span className="eyebrow"><span className="eyebrow-line" /> Credits</span>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, honest <span className="gradient-text">credit model.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
          Credits are consumed only on real provider runs — one per image, ten per five
          seconds of video. Every reservation is reserved up front and refunded
          automatically when a job fails.
        </p>
      </Reveal>
      <Reveal delay={120} className="mt-12 grid gap-5 sm:grid-cols-3">
        {[
          { icon: ImageIcon, title: "Images", body: "1 credit per still · professional mode ×2", note: "FLUX.1, MOSS GGUF LoRA, custom endpoints" },
          { icon: Film, title: "Video · 5s", body: "10 credits per clip · professional ×2", note: "Wan 2.2/2.5, LTX-Video families" },
          { icon: ShieldCheck, title: "Failures", body: "Automatic full refund", note: "Every deduction and refund is ledgered" },
        ].map((item) => (
          <div key={item.title} className="glass-strong rounded-3xl p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet/12 text-violet">
              <item.icon size={19} />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-white/95">{item.title}</h3>
            <p className="mt-2 text-sm font-semibold text-white/80">{item.body}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-dim">{item.note}</p>
          </div>
        ))}
      </Reveal>
      <Reveal delay={200}>
        <p className="mt-8 text-center text-xs text-dim">
          Credits are granted by the operator — this deployment runs no payment processor.{ " " }
          <Link href="/credits" className="text-violet underline-offset-4 hover:underline">
            See how credits work →
          </Link>
        </p>
      </Reveal>
    </section>
  );
}

/* ----------------------------------- faq ---------------------------------- */

const faqItems: FaqItem[] = [
  {
    question: "Are the generations real — or is this a demo?",
    answer:
      "Completely real. NEXORA submits jobs to configured generative model APIs and copies the results into private storage. The product never fabricates progress, sample outputs or simulated provider responses. If a provider is not configured, you get an explicit unavailability error instead of a fake result."
  },
  {
    question: "How do credits work?",
    answer:
      "Credits are reserved transactionally when a generation starts: one credit per image, ten per video. If the provider fails, the reserved credits are refunded automatically and idempotently. Credit packs are one-time purchases settled securely through Stripe."
  },
  {
    question: "Do credits expire?",
    answer:
      "No. Purchased credits stay on your account until you spend them. Every reservation, refund and purchase is recorded in an auditable ledger tied to your account."
  },
  {
    question: "Who can see my creations?",
    answer:
      "Only you. Generated media lives in private object storage scoped to your account and is served only through signed, expiring URLs. Row-level security ensures one account can never read another account's jobs or assets."
  },
  {
    question: "What happens if a generation fails?",
    answer:
      "The job records the exact failure state and error, reserved credits are refunded automatically, and you can immediately retry. Failed jobs remain visible in your history for transparency."
  },
  {
    question: "Which models does NEXORA run on?",
    answer:
      "NEXORA is provider-adapter based. The first adapter targets Replicate-hosted image and video models, with model identifiers and input schemas configured server-side by the operator. New providers plug into the same auditable job pipeline."
  }
];

function Faq() {
  return (
    <section id="faq" className="site-container scroll-mt-28 py-24">
      <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <Reveal>
          <span className="eyebrow"><span className="eyebrow-line" /> Answers</span>
          <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Questions,
            <br />
            <span className="gradient-text">answered straight.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            No fine print theatre. Here is exactly how the platform behaves —
            and what it will never do.
          </p>
          <Link href="/sign-in" className="btn-secondary mt-8">
            Still curious? Start creating <ArrowUpRight size={16} />
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <Accordion items={faqItems} />
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- cta ---------------------------------- */

function Cta() {
  return (
    <section className="site-container py-24">
      <Reveal>
        <div className="glass-strong relative overflow-hidden rounded-[2.25rem] px-8 py-16 text-center sm:px-16">
          <div aria-hidden className="absolute inset-0 opacity-70"
            style={{ background: "radial-gradient(ellipse 70% 120% at 50% 120%, rgba(124,92,255,.35), transparent 65%)" }} />
          <div aria-hidden className="absolute inset-0 grid-lines opacity-40" />
          <div className="relative">
            <span className="pill border-white/15 bg-white/5 text-white/70">
              <Play size={12} className="text-cyan" /> Your studio is ready
            </span>
            <h2 className="mx-auto mt-7 max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Your next idea deserves
              <br />
              <span className="gradient-text">real pixels.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted">
              Open the studio, describe your vision, and watch a real model bring it to life —
              safely stored, fully yours.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/studio" className="btn-primary">
                Open the Studio <ArrowUpRight size={17} />
              </Link>
              <Link href="/credits" className="btn-secondary">
                <Zap size={16} /> Explore credits
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------- landing -------------------------------- */

export function Landing() {
  return (
    <main>
      <Hero />
      <Marquee items={marqueeItems} />
      <Showcase />
      <Features />
      <Process />
      <PricingSection />
      <Faq />
      <Cta />
    </main>
  );
}
