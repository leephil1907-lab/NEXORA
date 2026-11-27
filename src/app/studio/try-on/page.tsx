"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImagePlus, LoaderCircle, Shirt, Sparkles } from "lucide-react";

type JobState = { id: string; status: "processing" | "completed" | "failed"; outputUrl?: string | null; error?: string };

async function upload(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/uploads", { method: "POST", body });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Image upload failed.");
  return payload.path as string;
}

export default function TryOnPage() {
  const [person, setPerson] = useState<File | null>(null);
  const [garment, setGarment] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState<JobState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!job || job.status !== "processing") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch(`/api/fashion/try-on?id=${encodeURIComponent(job.id)}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not check generation status.");
        if (!active) return;
        setJob(payload);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Status check failed.");
      }
      if (active) timer = setTimeout(poll, 3500);
    };
    timer = setTimeout(poll, 2500);
    return () => { active = false; clearTimeout(timer); };
  }, [job?.id, job?.status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setJob(null);
    if (!person || !garment) { setError("Upload both a person image and a garment image."); return; }
    if (!consent) { setError("Confirm the person has agreed to this virtual try-on."); return; }
    setBusy(true);
    try {
      const [modelImagePath, productImagePath] = await Promise.all([upload(person), upload(garment)]);
      const response = await fetch("/api/fashion/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelImagePath, productImagePath, consent: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not start virtual try-on.");
      setJob({ id: payload.id, status: "processing" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Virtual try-on failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"><ArrowLeft size={16} /> Back to Studio</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <section className="glass-strong rounded-3xl p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet/25 bg-violet/10 text-violet"><Shirt size={23} /></div>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet">NEXORA · Fashion studio</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Virtual try-on</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">See how an everyday clothing item looks on a person. Powered by a real hosted fashion model; results are saved to your private NEXORA storage.</p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block rounded-2xl border border-line bg-white/[0.025] p-4">
                <span className="mb-2 block text-sm font-semibold">Person image</span>
                <span className="mb-3 block text-xs text-muted">Use your own photo or an adult's photo with their explicit permission.</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPerson(e.target.files?.[0] ?? null)} className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-violet/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
                {person && <span className="mt-2 block text-xs text-cyan">{person.name}</span>}
              </label>
              <label className="block rounded-2xl border border-line bg-white/[0.025] p-4">
                <span className="mb-2 block text-sm font-semibold">Clothing / product image</span>
                <span className="mb-3 block text-xs text-muted">Upload a garment photo, flat-lay, or product image.</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setGarment(e.target.files?.[0] ?? null)} className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-violet/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
                {garment && <span className="mt-2 block text-xs text-cyan">{garment.name}</span>}
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-4 text-xs leading-relaxed text-white/80">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-violet" />
                <span>I confirm the person pictured is me or an adult who has explicitly consented to this clothing try-on. I will not upload intimate, exploitative, or non-consensual imagery.</span>
              </label>
              {error && <p role="alert" className="rounded-xl border border-rose/25 bg-rose/10 px-4 py-3 text-xs text-rose">{error}</p>}
              <button type="submit" disabled={busy || (job?.status === "processing")} className="btn-primary w-full">
                {busy ? <><LoaderCircle size={16} className="animate-spin" /> Uploading images…</> : <><Sparkles size={16} /> Generate try-on</>}
              </button>
            </form>
          </section>
          <section className="glass-strong flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-6 text-center">
            {job?.status === "completed" && job.outputUrl ? (
              <>
                <img src={job.outputUrl} alt="Generated virtual try-on result" className="max-h-[620px] w-full rounded-2xl object-contain" />
                <a href={job.outputUrl} target="_blank" rel="noreferrer" className="mt-4 text-sm font-semibold text-cyan underline">Open saved result</a>
              </>
            ) : job?.status === "failed" ? (
              <div><p className="font-semibold text-rose">Generation failed</p><p className="mt-2 text-sm text-muted">{job.error || "The provider could not complete this request."}</p></div>
            ) : job?.status === "processing" ? (
              <div><LoaderCircle size={32} className="mx-auto animate-spin text-violet" /><p className="mt-4 font-semibold">Creating your try-on</p><p className="mt-2 text-xs text-muted">The hosted model is processing your images. High-quality results can take up to a minute.</p></div>
            ) : (
              <div><ImagePlus size={34} className="mx-auto text-violet" /><p className="mt-4 font-semibold">Your result will appear here</p><p className="mt-2 max-w-xs text-xs leading-relaxed text-muted">Upload a person image and a clothing product image to begin.</p></div>
            )}
          </section>
        </div>
        <p className="mt-6 text-center text-[10px] leading-relaxed text-dim">FASHN API required. No mock images are generated. Virtual try-on supports ordinary clothing and accessories only in this NEXORA workflow.</p>
      </div>
    </main>
  );
}
