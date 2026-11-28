"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ArrowUpRight, Camera, Clapperboard, Image as ImageIcon, Layers, Paintbrush, PanelsTopLeft, Search, Shirt, Sparkles, UserRound } from "lucide-react";
import { TOOLS, type ToolCategory } from "@/lib/tools/registry";

const CATEGORIES: ("All" | ToolCategory)[] = ["All", "Images", "Video"];

const TOOL_ICONS: Record<string, typeof ImageIcon> = {
  "text-to-image": Sparkles,
  "image-editor": ImageIcon,
  "style-transfer": Layers,
  "avatar-studio": UserRound,
  "product-photography": Camera,
  "fashion-studio": Shirt,
  "background-editor": Paintbrush,
  "poster-studio": PanelsTopLeft,
  "text-to-video": Clapperboard,
  "image-to-video": Clapperboard,
};

export default function ToolsPage() {
  const [category, setCategory] = useState<"All" | ToolCategory>("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      TOOLS.filter(
        (tool) =>
          (category === "All" || tool.category === category) &&
          (tool.name + " " + tool.desc + " " + tool.tag).toLowerCase().includes(query.toLowerCase())
      ),
    [category, query]
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-line bg-panel p-8 sm:p-10">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lime">
            <Sparkles size={13} /> Browse creative tools
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Every tool. <span className="gradient-text">One focused studio.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Image and video tools with a single flow: upload or describe, configure, generate,
            download. Powered by the live NEXORA engine — real jobs, real results.
          </p>
        </section>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creative tools…"
              className="field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors duration-200 ${
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
          <h2 className="text-sm font-semibold text-white">Creative tools</h2>
          <p className="text-[11px] text-dim">{filtered.length} tools</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tool) => {
            const Icon = TOOL_ICONS[tool.slug] || (tool.category === "Images" ? ImageIcon : Clapperboard);
            return (
              <Link
                key={tool.slug}
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
                <div className="mt-3 flex flex-wrap gap-1">
                  {tool.steps.map((step, index) => (
                    <span key={step} className="rounded-full border border-line px-2 py-0.5 text-[8px] text-dim">
                      {index + 1}. {step}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-lime">
                  Open tool
                  <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-dim">No tools match “{query}”.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
