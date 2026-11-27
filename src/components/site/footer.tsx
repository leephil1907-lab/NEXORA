"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Cpu, Server, Sparkles } from "lucide-react";

type Engines = {
  selfHostedLlm?: boolean;
  selfHostedImage?: boolean;
  omega?: boolean;
  venice?: boolean;
  vipeak?: boolean;
  replicate?: boolean;
};

function EngineChip({ label, on, hint }: { label: string; on: boolean; hint: string }) {
  return (
    <span
      title={hint}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        on ? "border-mint/25 bg-mint/10 text-mint" : "border-line bg-white/[0.02] text-dim"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-mint" : "bg-white/20"}`} />
      {label}
    </span>
  );
}

/** Slim tool status bar: real engine availability, real links. */
export function Footer() {
  const [engines, setEngines] = useState<Engines | null>(null);
  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setEngines((data.engines ?? {}) as Engines))
      .catch(() => setEngines({}));
  }, []);

  return (
    <footer className="border-t border-line bg-ink/60">
      <div className="mx-auto max-w-[1400px] px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">
            <Activity size={11} /> Engines
          </span>
          <EngineChip label="Local companion" on hint="Pair your machine under Local — runs models on your own hardware." />
          <EngineChip label="Self-hosted endpoint" on={Boolean(engines?.selfHostedLlm)} hint="NEXORA_LLM_ENDPOINT / NEXORA_IMAGE_ENDPOINT" />
          <EngineChip label="Omega AI" on={Boolean(engines?.omega)} hint="OMEGA_API_KEY — hosted fallback (omegai.me)" />
          <EngineChip label="Venice" on={Boolean(engines?.venice)} hint="VENICE_API_KEY — hosted fallback (venice.ai)" />
          <EngineChip label="Vipeak 18+" on={Boolean(engines?.vipeak)} hint="VIPEAK_API_KEY — uncensored video API (123vips.com)" />
          <EngineChip label="Replicate" on={Boolean(engines?.replicate)} hint="REPLICATE_API_TOKEN — cloud GPU" />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-[11px] text-dim sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Sparkles size={12} className="text-lime" />
            NEXORA AI — local-first generation studio. Models run on your machine first; cloud is optional.
          </p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Footer">
            <Link href="/models" className="hover:text-white"><Cpu size={11} className="mr-1 inline" />Model catalog</Link>
            <Link href="/studio/local" className="hover:text-white"><Server size={11} className="mr-1 inline" />Local engine</Link>
            <Link href="/credits" className="hover:text-white">Credits</Link>
            <Link href="/legal/terms" className="hover:text-white">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
          </nav>
        </div>
        <p className="mt-3 text-[10px] text-white/25">© {new Date().getFullYear()} NEXORA AI. 18+ platform — adults only.</p>
      </div>
    </footer>
  );
}
