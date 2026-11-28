"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight, Clapperboard, Image as ImageIcon, Layers, Search, Sparkles,
} from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATES,
  type TemplateCategory,
  type TemplatePreset,
} from "@/lib/tools/templates";

const TILES: Record<TemplateCategory, string> = {
  Cinematic: "linear-gradient(135deg, rgba(34,211,238,.16), rgba(15,23,42,.6))",
  Fashion: "linear-gradient(135deg, rgba(163,230,53,.16), rgba(15,23,42,.6))",
  Glamour: "linear-gradient(135deg, rgba(250,204,21,.14), rgba(15,23,42,.6))",
  Romance: "linear-gradient(135deg, rgba(244,114,182,.14), rgba(15,23,42,.6))",
  Fitness: "linear-gradient(135deg, rgba(74,222,128,.16), rgba(15,23,42,.6))",
  Fantasy: "linear-gradient(135deg, rgba(129,140,248,.16), rgba(15,23,42,.6))",
  Product: "linear-gradient(135deg, rgba(148,163,184,.16), rgba(15,23,42,.6))",
};

function TemplateCard({ template, index }: { template: TemplatePreset; index: number }) {
  const Icon = template.kind === "video" ? Clapperboard : ImageIcon;
  return (
    <StaggerItem>
      <Link
        href={`/tools/${template.tool}?prompt=${encodeURIComponent(template.prompt)}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-colors duration-200 hover:border-lime/35"
      >
        <div
          className="relative flex h-32 items-center justify-center overflow-hidden"
          style={{ background: TILES[template.category] }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-lime">
            <Icon size={20} />
          </span>
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-ink/70 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/80">
            {template.category}
          </span>
          {template.badge && (
            <span className="absolute right-3 top-3 rounded-full border border-lime/25 bg-lime/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-lime">
              {template.badge}
            </span>
          )}
          <span className="absolute bottom-2 right-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/35">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-[13px] font-semibold text-white">{template.name}</h3>
          <p className="mt-1.5 line-clamp-3 flex-1 text-[10px] leading-relaxed text-muted">
            {template.prompt}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-lime">
            Try template <ArrowUpRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </StaggerItem>
  );
}

export function TemplatesClient() {
  const [category, setCategory] = useState<"All" | TemplateCategory>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      TEMPLATES.filter(
        (template) =>
          (category === "All" || template.category === category) &&
          (template.name + " " + template.prompt + " " + template.category)
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [category, query]
  );

  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-8">
      <Reveal>
        <section className="rounded-[2rem] border border-line bg-panel p-8 sm:p-10">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lime">
            <Layers size={13} /> Templates
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start from a preset. <span className="gradient-text">Make it yours.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Real prompt presets that open real tools — pick a category, open the template, and the
            studio is pre-filled and ready to generate. No templates based on real people.
          </p>
        </section>
      </Reveal>

      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search templates…"
            className="field pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["All", ...TEMPLATE_CATEGORIES] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-xl border px-3.5 py-2 text-[11px] font-semibold transition-colors duration-200 ${
                category === item
                  ? "border-lime/40 bg-lime/10 text-lime"
                  : "border-line bg-white/[0.02] text-muted hover:border-white/15 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles size={13} className="text-lime" />
          {category === "All" ? "All templates" : category}
        </h2>
        <p className="text-[11px] text-dim">{filtered.length} presets</p>
      </div>

      <StaggerGroup className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </StaggerGroup>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-dim">No templates match “{query}”.</p>
      )}
    </main>
  );
}
