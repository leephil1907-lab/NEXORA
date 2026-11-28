"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import {
  ArrowUpRight, Clapperboard, Image as ImageIcon, Images, Layers3,
  Sparkles, Shirt, WandSparkles, Video
} from "lucide-react";

const TOOLS = [
  { name: "AI Image Generator", cat: "Images", desc: "Create original visuals from a text prompt with NEXORA's connected image models.", icon: ImageIcon, href: "/studio?kind=image&workflow=text-to-image", tag: "Text to image" },
  { name: "Text to Image", cat: "Images", desc: "Turn a detailed description into a polished image. Choose a model, aspect ratio and creative direction.", icon: WandSparkles, href: "/studio?kind=image&workflow=text-to-image", tag: "Prompt based" },
  { name: "Image to Video", cat: "Video", desc: "Upload a still image, describe the movement and generate an animated video from it.", icon: Clapperboard, href: "/studio?kind=video&workflow=image-to-video", tag: "Image animation" },
  { name: "Text to Video", cat: "Video", desc: "Create cinematic clips from a written scene description using an available video model.", icon: Video, href: "/studio?kind=video&workflow=text-to-video", tag: "Prompt based" },
  { name: "Virtual Try-On", cat: "Creative", desc: "Explore outfit and fashion looks with the dedicated NEXORA try-on workspace.", icon: Shirt, href: "/studio/try-on", tag: "Fashion studio" },
  { name: "Creation Library", cat: "Creative", desc: "Browse your generated images and videos, revisit jobs and manage saved results.", icon: Images, href: "/studio/library", tag: "Your projects" },
  { name: "Generation Models", cat: "Creative", desc: "Review the image and video engines connected to NEXORA and their current availability.", icon: Layers3, href: "/models", tag: "Model catalog" },
];

const CATEGORIES = ["All", "Images", "Video", "Creative"];

export default function ToolsPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => TOOLS.filter((tool) =>
      (category === "All" || tool.cat === category) &&
      (tool.name + " " + tool.desc + " " + tool.cat).toLowerCase().includes(query.toLowerCase())
    ),
    [category, query]
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-8">
        <section className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 sm:p-9">
          <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/10 blur-3xl" />
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-lime">
            <Sparkles size={13} /> NEXORA creative studio
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Imagine it. <span className="gradient-text">Bring it to life.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Generate images, turn stills into video and explore creative workflows from one focused workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/studio?kind=image&workflow=text-to-image" className="btn-primary">Create an image <ArrowUpRight size={14} /></Link>
            <Link href="/studio?kind=video&workflow=image-to-video" className="btn-secondary">Animate an image <ArrowUpRight size={14} /></Link>
            <Link href="/models" className="btn-secondary">Explore models <ArrowUpRight size={14} /></Link>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search creative tools…"
            aria-label="Search creative tools"
            className="field flex-1"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`whitespace-nowrap rounded-xl border px-3 py-2 text-[11px] font-semibold ${category === item ? "border-lime/40 bg-lime/10 text-lime" : "border-line bg-panel text-muted"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Creative tools</h2>
          <span className="text-[10px] text-dim">{filtered.length} tools</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tool) => {
            const Icon = tool.icon;
            return (
              <article key={tool.name} className="group flex min-h-[190px] flex-col rounded-2xl border border-line bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:border-lime/25">
                <div className="flex items-start justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-lime/15 bg-lime/[.07] text-lime">
                    <Icon size={18} />
                  </span>
                  <span className="rounded-full border border-line px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-dim">{tool.tag}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{tool.name}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{tool.desc}</p>
                <Link href={tool.href} className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-lime">
                  Open tool <ArrowUpRight size={12} />
                </Link>
              </article>
            );
          })}
        </div>
        {!filtered.length && (
          <p className="mt-8 rounded-2xl border border-line bg-panel p-8 text-center text-sm text-muted">
            No matching tools. Try another search.
          </p>
        )}
        <p className="mt-8 text-center text-[10px] leading-relaxed text-dim">
          Generation availability depends on the connected provider and selected model. NEXORA only reports a tool as ready when its real provider is configured.
        </p>
      </main>
      <Footer />
    </>
  );
}
