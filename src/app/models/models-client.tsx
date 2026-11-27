"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowUpRight, Boxes, CheckCircle2, Cpu, Film, MessageSquare,
  Search, Server, ShieldAlert, Sparkles,
} from "lucide-react";

type LlmPublic = {
  id: string;
  label: string;
  family: string;
  sizeNote: string;
  runtime: "local" | "hosted";
  hfRepo?: string;
  hfRepoVerified: boolean;
  pullHint?: string;
  vramNote?: string;
  hostedVia?: "omega" | "venice";
  note?: string;
};

type GenerationPublic = {
  id: string;
  label: string;
  modality: "image" | "video";
  provider: string;
  source: string;
  tagline: string;
  ready: boolean;
};

type OgaiEntry = {
  id: string;
  name: string;
  category: string;
  summary: string;
  parameters: string[];
  enums: Record<string, string[]>;
};

type VipeakEntry = { id: string; label: string; kind: "t2v" | "i2v"; tagline: string };

function StatusPill({ tone, children, icon }: { tone: "ready" | "selfhost" | "catalog" | "locked"; children: React.ReactNode; icon?: React.ReactNode }) {
  const styles = {
    ready: "border-mint/25 bg-mint/10 text-mint",
    selfhost: "border-lime/25 bg-lime/10 text-lime",
    catalog: "border-amber/25 bg-amber/10 text-amber",
    locked: "border-line bg-white/[0.03] text-dim",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${styles[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  if (!query) return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function ModelsBrowser({
  llm,
  generation,
  ogai,
  vipeak,
}: {
  llm: LlmPublic[];
  generation: GenerationPublic[];
  ogai: OgaiEntry[];
  vipeak: VipeakEntry[];
}) {
  const [query, setQuery] = useState("");

  const llmFiltered = useMemo(
    () => llm.filter((m) => matches(query, m.label, m.family, m.hfRepo, m.note)),
    [llm, query]
  );
  const generationFiltered = useMemo(
    () => generation.filter((m) => matches(query, m.label, m.source, m.tagline, m.id)),
    [generation, query]
  );
  const ogaiFiltered = useMemo(
    () => ogai.filter((m) => matches(query, m.name, m.id, m.summary)),
    [ogai, query]
  );
  const vipeakFiltered = useMemo(
    () => vipeak.filter((m) => matches(query, m.label, m.tagline)),
    [vipeak, query]
  );

  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-8">
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-lime">
            <Boxes size={12} /> Model catalog
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Every model, <span className="gradient-text">honest availability</span>
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
            Local-first: uncensored models run on your own machine. Cloud engines light up only when
            configured. Nothing here is simulated — unconnected models say exactly that.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models, families, repos…"
            className="field pl-10"
          />
        </div>
      </div>

      {/* -------------------------- uncensored chat LLMs -------------------------- */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <MessageSquare size={14} className="text-lime" /> Uncensored chat models
          <span className="rounded-full bg-lime/10 px-2 py-0.5 text-[9px] font-bold text-lime">LOCAL FIRST</span>
        </h2>
        <p className="mt-1 text-[11px] text-dim">
          The operator&apos;s model list. Primary runtime is your machine (Local Companion / llama.cpp / LM Studio / Ollama);
          hosted engines are fallbacks. <Link href="/chat" className="text-cyan hover:underline">Open chat →</Link>
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {llmFiltered.map((model) => (
            <article key={model.id} className="flex flex-col rounded-2xl border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13px] font-semibold text-white">{model.label}</h3>
                {model.runtime === "local" ? (
                  <StatusPill tone="selfhost" icon={<Cpu size={10} />}>self-host</StatusPill>
                ) : (
                  <StatusPill tone="catalog" icon={<Sparkles size={10} />}>hosted</StatusPill>
                )}
              </div>
              <p className="mt-1 text-[10px] text-dim">{model.family} · {model.sizeNote} · {model.vramNote || "—"}</p>
              {model.hfRepo && (
                <a
                  href={`https://huggingface.co/${model.hfRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 break-all text-[10px] font-semibold text-cyan hover:underline"
                >
                  {model.hfRepoVerified ? "Verified: " : "Build: "}{model.hfRepo} <ArrowUpRight size={9} />
                </a>
              )}
              {model.pullHint && <p className="mt-1 text-[9px] text-muted">Pull: {model.pullHint}</p>}
              {model.note && <p className="mt-2 text-[9px] leading-relaxed text-dim">{model.note}</p>}
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------- generation models --------------------------- */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Film size={14} className="text-lime" /> Image & video generation models
        </h2>
        <p className="mt-1 text-[11px] text-dim">
          Runnable in the <Link href="/" className="text-cyan hover:underline">studio</Link> — self-hosted endpoints first, Replicate cloud optional.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {generationFiltered.map((model) => (
            <article key={model.id} className="rounded-2xl border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13px] font-semibold text-white">{model.label}</h3>
                {model.ready ? (
                  <StatusPill tone="ready" icon={<CheckCircle2 size={10} />}>ready</StatusPill>
                ) : (
                  <StatusPill tone="locked" icon={<AlertTriangle size={10} />}>not configured</StatusPill>
                )}
              </div>
              <p className="mt-1 text-[10px] text-dim">{model.modality === "video" ? "Video" : "Image"} · {model.provider}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-muted">{model.tagline}</p>
              <p className="mt-2 text-[9px] text-dim">{model.source}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------- Vipeak 18+ ------------------------------ */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldAlert size={14} className="text-rose" /> Vipeak uncensored video line (18+)
        </h2>
        <p className="mt-1 text-[11px] text-dim">
          Seedance Spicy & Wan NSFW via the Vipeak AI API (123vips.com). Adults only. Full API access unlocks
          inside a signed-in 123vips.com account — then set VIPEAK_BASE_URL / VIPEAK_API_KEY.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {vipeakFiltered.map((model) => (
            <article key={model.id} className="rounded-2xl border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-white">{model.label}</h3>
                <StatusPill tone="locked">docs access</StatusPill>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted">{model.tagline}</p>
            </article>
          ))}
        </div>
        <a
          href="https://github.com/wideeyededi/uncensored-nsfw-ai-video-api"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan hover:underline"
        >
          Integration guide: wideeyededi/uncensored-nsfw-ai-video-api <ArrowUpRight size={10} />
        </a>
      </section>

      {/* --------------------- Open Generative AI catalog (t2i) ------------------- */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Server size={14} className="text-cyan" /> Open Generative AI catalog
          <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[9px] font-bold text-cyan">{ogai.length} MODELS</span>
        </h2>
        <p className="mt-1 text-[11px] text-dim">
          The text-to-image model line and request schemas from{" "}
          <a href="https://github.com/leephil1907-lab/Open-Generative-AI" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
            leephil1907-lab/Open-Generative-AI
          </a>{" "}
          (MIT). Each entry is a real model with a real input schema. They run when a compatible backend is
          connected (MuAPI tier or equivalent endpoint) — until then they are browsable here with exact
          parameters, honestly marked.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ogaiFiltered.map((model) => (
            <article key={model.id} className="rounded-2xl border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-white">{model.name}</h3>
                <StatusPill tone="catalog">catalog</StatusPill>
              </div>
              <p className="mt-1 text-[9px] text-dim">{model.id} · {model.category}</p>
              <p className="mt-2 line-clamp-3 text-[10px] leading-relaxed text-muted">{model.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {model.parameters.slice(0, 6).map((parameter) => (
                  <span key={parameter} className="rounded-full border border-line bg-white/[0.02] px-1.5 py-0.5 text-[8px] text-dim">
                    {parameter}
                  </span>
                ))}
                {model.parameters.length > 6 && (
                  <span className="rounded-full border border-line px-1.5 py-0.5 text-[8px] text-dim">
                    +{model.parameters.length - 6} more
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {llmFiltered.length + generationFiltered.length + ogaiFiltered.length + vipeakFiltered.length === 0 && (
        <p className="py-16 text-center text-sm text-dim">No models match “{query}”.</p>
      )}
    </main>
  );
}
