"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle, ArrowUpRight, Check, CheckCircle2, Clock3, Download, Film,
  Image as ImageIcon, LoaderCircle, Plus, Settings2, Sparkles, ShieldAlert,
  Star, ThumbsDown, ThumbsUp, Timer, X
} from "lucide-react";
import type { AdminUser, Job, JobStatus } from "@/lib/generations/types";
import { formatDate, cn } from "@/lib/utils";

/* -------------------------------- status chip ------------------------------- */

const statusStyles: Record<JobStatus, string> = {
  succeeded: "border-mint/25 bg-mint/10 text-mint",
  failed: "border-rose/25 bg-rose/10 text-rose",
  storage_failed: "border-amber/25 bg-amber/10 text-amber",
  processing: "border-cyan/25 bg-cyan/10 text-cyan",
  queued: "border-white/12 bg-white/5 text-white/60"
};

export function StatusChip({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", statusStyles[status], className)}>
      {(status === "queued" || status === "processing") && <LoaderCircle size={10} className="animate-spin" />}
      {status === "succeeded" && <CheckCircle2 size={10} />}
      {status === "failed" && <AlertTriangle size={10} />}
      {status === "storage_failed" && <ShieldAlert size={10} />}
      {status.replace("_", " ")}
    </span>
  );
}

/* ------------------------------ config screens ------------------------------ */

export function ConfigScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-strong w-full max-w-lg rounded-[1.75rem] p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber/12 text-amber">
          <Settings2 size={24} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Studio setup required</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          This NEXORA deployment is not connected to its backend services yet. Set the Supabase
          environment variables (<code className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-lime">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-lime">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) to enable
          real authentication, jobs and storage.
        </p>
        <p className="mt-4 text-xs text-dim">
          The studio will never show simulated generations or sample data while services are missing.
        </p>
        <Link href="/" className="btn-secondary mt-8">Back to homepage</Link>
      </div>
    </main>
  );
}

export function SignedOutScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-strong relative w-full max-w-lg overflow-hidden rounded-[1.75rem] p-10 text-center">
        <div aria-hidden className="absolute inset-x-0 -top-24 h-48 opacity-60"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,92,255,.35), transparent 70%)" }} />
        <div className="relative">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-lime/25 to-cyan/12 text-lime">
            <Sparkles size={24} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
            Your studio awaits.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Sign in to run real generations in the studio, chat with the assistant, and keep
            every asset in your private library. No demo data — just your work.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/sign-in?next=%2F" className="btn-primary whitespace-nowrap">
              Sign in to continue <ArrowUpRight size={16} />
            </Link>
            <Link href="/tools" className="btn-secondary whitespace-nowrap">Browse tools</Link>
            <Link href="/chat" className="btn-secondary whitespace-nowrap">Uncensored chat</Link>
          </div>
          <p className="mt-7 text-[11px] text-dim">
            Real engines · Passwordless access · Private storage · Automatic failure refunds
          </p>
        </div>
      </div>
    </main>
  );
}

/* --------------------------- sensitive gate dialog -------------------------- */

export function SensitiveGate({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  const [adult, setAdult] = useState(false);
  const [rules, setRules] = useState(false);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/80 px-6">
      <div className="glass-strong w-full max-w-md rounded-[1.5rem] p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose/12 text-rose">
            <ShieldAlert size={20} />
          </span>
          <button type="button" onClick={onCancel} className="btn-ghost !p-2" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <h3 className="mt-5 font-display text-xl font-bold tracking-tight">Sensitive content mode · 18+</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Sensitive mode relaxes output filtering on models that support it. It is strictly
          limited to consenting, adult creative work.
        </p>
        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-3.5 text-xs leading-relaxed text-white/85">
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5 accent-lime" />
            I am 18 years of age or older.
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-3.5 text-xs leading-relaxed text-white/85">
            <input type="checkbox" checked={rules} onChange={(e) => setRules(e.target.checked)} className="mt-0.5 accent-lime" />
            I will not generate sexual content involving minors, real people without their
            consent, or any non-consensual intimate imagery. Violations end my access.
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button type="button" disabled={!adult || !rules} onClick={onAccept} className="btn-primary flex-1">
            Enable sensitive mode
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- job view -------------------------------- */

export function JobView({
  job,
  canExtend,
  onFavorite,
  onRate,
  onExtend,
  onUseImage
}: {
  job: Job;
  canExtend: boolean;
  onFavorite?: (job: Job) => void;
  onRate?: (job: Job, rating: 1 | -1 | null) => void;
  onExtend?: (job: Job) => void;
  onUseImage?: (job: Job) => void;
}) {
  const pending = job.status === "queued" || job.status === "processing" || job.status === "storage_failed";
  return (
    <div className="glass-strong overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">Preview</span>
          <StatusChip status={job.status} />
        </div>
        <div className="flex items-center gap-1.5">
          {job.assetUrl && onFavorite && (
            <button
              type="button"
              onClick={() => onFavorite(job)}
              className={cn("btn-ghost !p-2", job.favorite && "text-amber")}
              aria-label={job.favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={15} fill={job.favorite ? "currentColor" : "none"} />
            </button>
          )}
          {job.assetUrl && (
            <a href={job.assetUrl} target="_blank" rel="noreferrer" className="btn-ghost !p-2" aria-label="Download">
              <Download size={15} />
            </a>
          )}
        </div>
      </div>

      {job.assetUrl ? (
        job.kind === "image" ? (
          <Image
            className="max-h-[560px] w-full bg-ink object-contain"
            src={job.assetUrl}
            alt="Generated result"
            width={1600}
            height={1200}
            unoptimized
          />
        ) : (
          <video className="max-h-[560px] w-full bg-ink" src={job.assetUrl} controls playsInline />
        )
      ) : (
        <div className="relative flex min-h-[300px] flex-col items-center justify-center gap-4 px-8 py-14 text-center">
          <div aria-hidden className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(ellipse at center, rgba(124,92,255,.14), transparent 65%)" }} />
          <span className="relative grid h-16 w-16 place-items-center rounded-3xl border border-lime/25 bg-lime/8 text-lime">
            {pending ? <LoaderCircle size={26} className="animate-spin" /> : <Sparkles size={26} />}
          </span>
          <div className="relative">
            <p className="font-display text-lg font-semibold text-white/95">
              {job.status === "queued"
                ? "Waiting in the queue"
                : job.status === "processing"
                  ? "Creating your vision"
                  : job.status === "storage_failed"
                    ? "Storage needs attention"
                    : job.status === "failed"
                      ? "Generation failed"
                      : "Preparing your result"}
            </p>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted">
              {job.error_message ||
                (pending
                  ? "Live status is read from the provider — never simulated. Keep this workspace open."
                  : "The provider completed, but the media file has not been confirmed in storage.")}
            </p>
          </div>
          {pending && (
            <div className="relative mt-1 h-1 w-44 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-1/2 animate-shimmer rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,.9), transparent)", backgroundSize: "200% 100%" }} />
            </div>
          )}
        </div>
      )}

      {job.assetUrl && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-dim">Satisfied with the results?</span>
            <button
              type="button"
              onClick={() => onRate?.(job, job.rating === 1 ? null : 1)}
              className={cn("btn-ghost !p-1.5", job.rating === 1 && "text-mint")}
              aria-label="Satisfied"
            >
              <ThumbsUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => onRate?.(job, job.rating === -1 ? null : -1)}
              className={cn("btn-ghost !p-1.5", job.rating === -1 && "text-rose")}
              aria-label="Not satisfied"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
          {job.kind === "image" && job.status === "succeeded" && job.asset_path && onUseImage && (
            <button type="button" onClick={() => onUseImage(job)} className="btn-primary !py-2 text-xs">
              <Film size={13} /> Use image for video
            </button>
          )}
          {canExtend && job.kind === "video" && onExtend && (
            <button type="button" onClick={() => onExtend(job)} className="btn-secondary !py-2 text-xs">
              <Timer size={13} /> Extend +5s
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-line p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusChip status={job.status} />
            <span className="text-[10px] uppercase tracking-[0.16em] text-dim">
              {job.model_id ? `${job.model_id} · ` : ""}{job.kind} · {job.aspect_ratio} · {formatDate(job.created_at)}
            </span>
          </div>
          <p className="mt-2.5 line-clamp-2 text-sm text-muted">{job.prompt}</p>
        </div>
        {job.assetUrl && (
          <a href={job.assetUrl} target="_blank" rel="noreferrer" className="btn-secondary shrink-0 !py-2.5 text-xs">
            <Download size={14} /> Download
          </a>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- library --------------------------------- */

export type LibraryFilter = "all" | "images" | "videos" | "favorites";

export function LibraryTabs({ value, onChange, counts }: {
  value: LibraryFilter;
  onChange: (value: LibraryFilter) => void;
  counts: Record<LibraryFilter, number>;
}) {
  const tabs: { id: LibraryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "images", label: "Images" },
    { id: "videos", label: "Videos" },
    { id: "favorites", label: "Favorites" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-200",
            value === tab.id
              ? "border-lime/50 bg-lime/15 text-white"
              : "border-line bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
          )}
        >
          {tab.label}
          <span className="ml-1.5 text-[9px] text-dim">{counts[tab.id]}</span>
        </button>
      ))}
    </div>
  );
}

export function LibraryGrid({
  jobs,
  activeId,
  onSelect
}: {
  jobs: Job[];
  activeId?: string | null;
  onSelect: (job: Job) => void;
}) {
  if (jobs.length === 0) {
    return (
      <div className="glass rounded-3xl border-dashed px-8 py-16 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-lime">
          <Plus size={20} />
        </span>
        <p className="mt-5 font-display text-base font-semibold text-white/90">
          Your creative history starts here
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Completed and in-progress generations appear here automatically. Nothing is
          pre-filled — your first creation will be the first entry.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => {
        const isActive = job.id === activeId;
        return (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelect(job)}
            className={cn(
              "glass-strong card-hover group overflow-hidden rounded-2xl text-left",
              isActive && "border-lime/45 shadow-glow-sm"
            )}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
              {job.assetUrl ? (
                job.kind === "image" ? (
                  <Image
                    src={job.assetUrl}
                    alt={job.prompt}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 ease-swift group-hover:scale-[1.04]"
                  />
                ) : (
                  <video className="h-full w-full object-cover" src={job.assetUrl} muted playsInline preload="metadata" />
                )
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-white/40">
                    {job.kind === "image" ? <ImageIcon size={17} /> : <Film size={17} />}
                  </span>
                  {(job.status === "queued" || job.status === "processing") && (
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-cyan">
                      <LoaderCircle size={10} className="animate-spin" /> {job.status}
                    </span>
                  )}
                  {job.status === "failed" && (
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-rose">
                      <AlertTriangle size={10} /> Failed
                    </span>
                  )}
                  {job.status === "storage_failed" && (
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-amber">
                      <ShieldAlert size={10} /> Storage
                    </span>
                  )}
                </div>
              )}
              <div className="absolute left-3 top-3">
                <StatusChip status={job.status} className="bg-ink/70" />
              </div>
              {job.favorite && (
                <span className="absolute right-3 top-3 text-amber"><Star size={13} fill="currentColor" /></span>
              )}
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-xs leading-relaxed text-white/85">{job.prompt}</p>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[10px] text-dim">
                  <Clock3 size={10} /> {formatDate(job.created_at)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-dim">
                  {job.kind} · {job.aspect_ratio}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- credits ---------------------------------- */

export function CreditsPanel({ credits, imageCost, videoCost }: {
  credits: number | null;
  imageCost: number;
  videoCost: number;
}) {
  const rows = [
    { label: "Image generation", detail: "per still · professional mode ×2", value: `${imageCost} credit${imageCost === 1 ? "" : "s"}` },
    { label: "Video · 5 seconds", detail: "standard mode · professional ×2", value: `${videoCost} credits` },
    { label: "Video · 10 seconds", detail: "standard mode · professional ×2", value: `${videoCost * 2} credits` },
    { label: "Failed generations", detail: "automatic refund to your balance", value: "Free" },
  ];
  return (
    <div className="glass-strong rounded-3xl p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime">Account</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-white/95">Credit ledger</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-dim">Available</p>
          <p className="font-display text-3xl font-extrabold text-white">{credits === null ? "—" : credits.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-6 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-white/85">{row.label}</p>
              <p className="mt-0.5 text-[10px] text-dim">{row.detail}</p>
            </div>
            <p className="text-xs font-bold text-white/90">{row.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[11px] leading-relaxed text-dim">
        Credits are consumed only on real provider runs and refunded automatically when a
        generation fails. Purchases are handled by your operator — this deployment runs no
        payment processor. Every deduction and refund is recorded in the credit ledger.
      </p>
    </div>
  );
}

/* ------------------------------- admin panel ------------------------------- */

export function AdminPanel({
  users,
  busy,
  onSubmit
}: {
  users: AdminUser[];
  busy: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime">Administration</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-white/95">Manage user credits</h3>
        </div>
        <span className="pill border-amber/25 bg-amber/8 text-amber">
          <ShieldAlert size={11} /> Admin only
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_.6fr_1.2fr_auto]">
        <label className="grid gap-2 text-xs font-semibold text-white/70">
          Account
          <select name="userId" required defaultValue="" className="field">
            <option value="" disabled>Choose a user account</option>
            {users.map((item) => (
              <option key={item.id} value={item.id}>
                {item.email || item.display_name || item.id} · {item.credits} credits
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-white/70">
          Credit change
          <input name="amount" type="number" required min={-100000} max={100000} defaultValue={50} className="field" />
        </label>
        <label className="grid gap-2 text-xs font-semibold text-white/70">
          Reason
          <input name="reason" required minLength={5} maxLength={500} placeholder="Support adjustment or promotion" className="field" />
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={busy} className="btn-primary w-full whitespace-nowrap">
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}
