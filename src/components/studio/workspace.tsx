"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  AlertTriangle, ArrowUpRight, Camera, ChevronDown, Film,
  Gauge, Image as ImageIcon, LayoutGrid, Library, LoaderCircle, LogOut, MessageSquare, Plus, ShieldAlert,
  ShieldCheck, Sparkles, Timer, Trash2, UploadCloud, Volume2, WandSparkles, Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Logo } from "@/components/ui/logo";
import {
  AdminPanel, ConfigScreen, CreditsPanel, JobView, LibraryGrid, LibraryTabs,
  SensitiveGate, SignedOutScreen, type LibraryFilter
} from "@/components/studio/panels";
import type { AdminUser, AppConfig, CatalogModelPublic, Job } from "@/lib/generations/types";
import type { GenerationSettingsSnapshot } from "@/lib/generations/types";
import type { ToolEntry } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

const ASPECTS = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
const CAMERAS = [
  { id: "static", label: "Static" },
  { id: "pan-left", label: "Pan left" },
  { id: "pan-right", label: "Pan right" },
  { id: "tilt-up", label: "Tilt up" },
  { id: "tilt-down", label: "Tilt down" },
  { id: "dolly-in", label: "Dolly in" },
  { id: "dolly-out", label: "Dolly out" },
  { id: "orbit-left", label: "Orbit left" },
  { id: "orbit-right", label: "Orbit right" },
  { id: "handheld", label: "Handheld" },
];

const PRESETS = [
  "A cinematic editorial portrait at golden hour, soft directional light, 85mm lens, shallow depth of field, rich skin texture, natural grain.",
  "A slow aerial push over a rain-soaked neon city at blue hour, reflections on wet asphalt, volumetric fog, anamorphic flares.",
  "A product macro on black glass: brushed metal, single hard key light, subtle rim highlight, ultra-detailed surface texture.",
];

const defaultConfig: AppConfig = {
  authEnabled: true,
  generationEnabled: false,
  assistantEnabled: false,
  sensitiveEnabled: false,
  imageCreditCost: 1,
  videoCreditCost: 10,
  maxUploadMb: 20,
  models: [],
};

export function Workspace({ view = "create", tool }: { view?: "create" | "library" | "credits" | "admin"; tool?: ToolEntry }) {
  const searchParams = useSearchParams();
  const initialPrompt = (searchParams.get("prompt") ?? tool?.promptTemplate ?? "").slice(0, 2500);

  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const [ready, setReady] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ageBusy, setAgeBusy] = useState(false);
  const [ageError, setAgeError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [credits, setCredits] = useState<number | null>(null);
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");

  // Compose state
  const [kind, setKind] = useState<"image" | "video">(tool?.kind ?? (searchParams.get("kind") === "video" ? "video" : "image"));
  const [prompt, setPrompt] = useState(initialPrompt);
  const [modelId, setModelId] = useState("");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState("480p");
  const [aspect, setAspect] = useState("16:9");
  const [mode] = useState<"standard">("standard");
  const [guidance, setGuidance] = useState(5);
  const [camera, setCamera] = useState("static");
  const [sensitive, setSensitive] = useState(false);
  const [sensitiveConsent, setSensitiveConsent] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [selectedReferenceAssetPath, setSelectedReferenceAssetPath] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [endEnabled, setEndEnabled] = useState(false);
  const [endFile, setEndFile] = useState<File | null>(null);
  const [endPreview, setEndPreview] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [assistBusy, setAssistBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "info" | "error"; text: string } | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const endInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (referencePreview) URL.revokeObjectURL(referencePreview);
    };
  }, [referencePreview]);
  useEffect(() => {
    return () => {
      if (endPreview) URL.revokeObjectURL(endPreview);
    };
  }, [endPreview]);

  function clearReference() {
    setReferenceFile(null);
    setSelectedReferenceAssetPath(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function clearEnd() {
    setEndEnabled(false);
    setEndFile(null);
    setEndPreview(null);
    if (endInputRef.current) endInputRef.current.value = "";
  }

  /* ------------------------------- model state ------------------------------ */

  const modelsForKind = useMemo(
    () => config.models.filter((m) => m.modality === kind && m.ready),
    [config.models, kind]
  );
  const currentModel: CatalogModelPublic | undefined = useMemo(
    () => config.models.find((m) => m.id === modelId) ?? modelsForKind[0],
    [config.models, modelId, modelsForKind]
  );

  useEffect(() => {
    if (modelsForKind.length > 0 && !modelsForKind.some((m) => m.id === modelId)) {
      const workflow = searchParams.get("workflow") ?? tool?.workflow;
      const preferred = tool?.preferredModelId
        ? modelsForKind.find((m) => m.id === tool?.preferredModelId)
        : undefined;
      const workflowModel = workflow === "image-to-video" || workflow === "video-audio"
        ? modelsForKind.find((m) => m.capabilities.imageToVideo)
        : workflow === "text-to-video"
          ? modelsForKind.find((m) => m.capabilities.textToVideo)
          : workflow === "image-edit" || workflow === "pose"
            ? modelsForKind.find((m) => m.capabilities.referenceImage)
            : workflow === "video-extension" || workflow === "video-studio"
              ? modelsForKind.find((m) => m.capabilities.videoExtend)
              : undefined;
      const localFirst = modelsForKind.find((m) => m.provider === "custom-image" || m.provider === "custom-llm");
      setModelId((preferred ?? workflowModel ?? localFirst ?? modelsForKind[0]).id);
    }
  }, [modelsForKind, modelId, searchParams, tool]);

  useEffect(() => {
    if (!currentModel) return;
    if (currentModel.durations.length > 0 && !currentModel.durations.includes(duration)) {
      setDuration(currentModel.durations[currentModel.durations.length - 1]);
    }
    if (currentModel.resolutions.length > 0 && !currentModel.resolutions.includes(resolution)) {
      setResolution(currentModel.resolutions[0]);
    }
  }, [currentModel, duration, resolution]);

  const caps = currentModel?.capabilities;
  const isVideo = kind === "video";
  const cost = isVideo
    ? Math.max(1, Math.ceil((config.videoCreditCost * duration) / 5))
    : config.imageCreditCost;

  /* ------------------------------- data loading ------------------------------ */

  const refreshAccount = useCallback(async () => {
    if (!supabase) {
      setReady(true);
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      // Reveal the workspace as soon as authentication is known. Profile,
      // history and admin data load in parallel without blocking first paint.
      setReady(true);
      if (!currentUser) return;

      const [profileResult, generationsResponse] = await Promise.all([
        supabase.from("profiles")
          .select("credits,role,age_verified_at")
          .eq("id", currentUser.id)
          .single(),
        fetch("/api/generations?limit=18", { cache: "no-store" }),
      ]);

      const { data } = profileResult;
      if (data) {
        setAgeVerified(Boolean(data.age_verified_at));
        setCredits(data.credits);
        const isAdmin = data.role === "admin";
        setRole(isAdmin ? "admin" : "customer");
        if (isAdmin) {
          const adminResponse = await fetch("/api/admin/credits", { cache: "no-store" });
          if (adminResponse.ok) {
            const adminPayload = await adminResponse.json();
            setAdminUsers(adminPayload.users || []);
          }
        } else {
          setAdminUsers([]);
        }
      }

      if (generationsResponse.ok) {
        const payload = await generationsResponse.json();
        setJobs(payload.generations || []);
      }
    } catch {
      // Keep the authenticated shell usable; secondary account data can retry
      // on the next auth event or user action.
      setReady(true);
    }
  }, [supabase]);

  useEffect(() => {
    void fetch("/api/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: AppConfig) => {
        setConfig({ ...defaultConfig, ...payload });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    void refreshAccount().finally(() => setReady(true));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void refreshAccount();
    });
    return () => subscription.unsubscribe();
  }, [supabase, refreshAccount]);

  /* ------------------------------- job polling ------------------------------- */

  useEffect(() => {
    if (!activeJob || !["queued", "processing", "storage_failed"].includes(activeJob.status)) return;
    const jobId = activeJob.id;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/generations/${jobId}`, { cache: "no-store" });
        const payload = await response.json();
        if (response.ok) {
          setActiveJob(payload);
          if (!["queued", "processing", "storage_failed"].includes(payload.status)) {
            window.clearInterval(timer);
            await refreshAccount();
          }
        }
      } catch {
        // Transient network error — polling continues; state is never fabricated.
      }
    }, 3500);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.id, activeJob?.status]);

  /* --------------------------------- actions -------------------------------- */

  async function uploadOne(file: File): Promise<string> {
    const upload = new FormData();
    upload.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: upload });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Reference image upload failed.");
    return payload.path as string;
  }

  function buildSettings() {
    return {
      modelId: currentModel?.id ?? "",
      durationSeconds: isVideo ? duration : 0,
      resolution,
      aspectRatio: aspect,
      mode,
      cameraMovement: camera,
      guidance,
      audio: false,
      sensitive,
    };
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!currentModel) {
      setMessage({ type: "error", text: "The generation engine for this tool is not ready. Check the Gemini connection and try again." });
      return;
    }
    if (tool?.needsReference && !referenceFile && !selectedReferenceAssetPath) {
      setMessage({ type: "error", text: `Upload a reference image before using ${tool.name}.` });
      return;
    }
    if (endEnabled && !endFile) {
      setMessage({ type: "error", text: "Upload the end frame or turn off the end-frame option." });
      return;
    }
    setBusy(true);
    try {
      let referenceAssetPath: string | undefined = selectedReferenceAssetPath || undefined;
      let endAssetPath: string | undefined;
      if (referenceFile) referenceAssetPath = await uploadOne(referenceFile);
      if (endEnabled && endFile) endAssetPath = await uploadOne(endFile);

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          prompt,
          settings: buildSettings(),
          referenceAssetPath,
          endAssetPath,
          sensitiveConsent: sensitive ? sensitiveConsent || undefined : undefined,
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Generation request failed.");
      setActiveJob({
        id: payload.id,
        kind,
        prompt,
        aspect_ratio: aspect,
        status: payload.status,
        model_id: currentModel.id,
        created_at: new Date().toISOString()
      });
      setMessage({ type: "info", text: "Your request was accepted by the configured provider." });
      await refreshAccount();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not start generation." });
    } finally {
      setBusy(false);
    }
  }

  function useGeneratedImageAsVideoSource(job: Job) {
    if (job.kind !== "image" || job.status !== "succeeded" || !job.asset_path || !job.assetUrl) return;
    const videoModel = config.models.find(
      (candidate) => candidate.modality === "video" && candidate.ready && candidate.capabilities.imageToVideo
    );
    if (!videoModel) {
      setMessage({ type: "error", text: "No ready image-to-video model is configured on this deployment." });
      return;
    }
    setKind("video");
    setModelId(videoModel.id);
    setReferenceFile(null);
    setSelectedReferenceAssetPath(job.asset_path);
    setReferencePreview(job.assetUrl);
    setPrompt(job.prompt);
    setActiveJob(null);
    setMessage({ type: "info", text: "Generated image loaded as the video start frame. Add a motion prompt, then generate." });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function extend(job: Job) {
    setMessage(null);
    setBusy(true);
    try {
      const jobSettings = job.settings as GenerationSettingsSnapshot | null;
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "video",
          prompt: job.prompt,
          settings: {
            modelId: jobSettings?.modelId || job.model_id || currentModel?.id || "",
            durationSeconds: 5,
            resolution: jobSettings?.resolution || "480p",
            aspectRatio: job.aspect_ratio,
            mode: jobSettings?.mode || "standard",
            cameraMovement: jobSettings?.cameraMovement || "static",
            guidance: jobSettings?.guidance ?? 5,
            audio: false,
            sensitive: jobSettings?.sensitive ?? false,
          },
          videoAssetPath: job.asset_path || undefined,
          extendedFrom: job.id,
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Extension request failed.");
      setActiveJob({
        id: payload.id,
        kind: "video",
        prompt: job.prompt,
        aspect_ratio: job.aspect_ratio,
        status: payload.status,
        model_id: job.model_id,
        extended_from: job.id,
        created_at: new Date().toISOString(),
      });
      setMessage({ type: "info", text: "Continuation job accepted — extending the clip by 5 seconds." });
      await refreshAccount();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not extend the clip." });
    } finally {
      setBusy(false);
    }
  }

  async function patchJob(job: Job, patch: { favorite?: boolean; rating?: 1 | -1 | null }) {
    try {
      const response = await fetch(`/api/generations/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Update failed.");
      const merge = (j: Job): Job => (j.id === job.id ? { ...j, ...payload } : j);
      setJobs((prev) => prev.map(merge));
      setActiveJob((prev) => (prev ? merge(prev) : prev));
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed." });
    }
  }

  async function enhancePrompt() {
    setAssistBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "enhance" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Prompt assistant failed.");
      setPrompt(String(payload.text || "").slice(0, 2500));
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Prompt assistant failed." });
    } finally {
      setAssistBusy(false);
    }
  }

  async function adjustCredits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setAdminBusy(true);
    setAdminMessage("");
    try {
      const response = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(form.get("userId") || ""),
          amount: Number(form.get("amount")),
          reason: String(form.get("reason") || "")
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Credit adjustment failed.");
      setAdminMessage("Credit adjustment applied.");
      formElement.reset();
      await refreshAccount();
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "Credit adjustment failed.");
    } finally {
      setAdminBusy(false);
    }
  }

  async function verifyAge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAgeBusy(true);
    setAgeError("");
    try {
      const response = await fetch("/api/age-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateOfBirth, confirm: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Age verification failed.");
      setAgeVerified(true);
    } catch (error) {
      setAgeError(error instanceof Error ? error.message : "Age verification failed.");
    } finally {
      setAgeBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
    setJobs([]);
    setActiveJob(null);
    window.location.assign("/");
  }

  /* -------------------------------- rendering -------------------------------- */

  if (!supabase) return <ConfigScreen />;
  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle size={22} className="animate-spin text-lime" />
      </main>
    );
  }
  if (!user) return <SignedOutScreen />;
  if (!ageVerified) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <section className="glass-strong w-full max-w-lg rounded-[1.75rem] p-7 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lime/25 bg-lime/10 text-lime">
            <ShieldCheck size={26} />
          </div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-lime">NEXORA · Age assurance</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">Adults only. 18+</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">Confirm your date of birth to enter the studio. Your date of birth is checked on the server and is not stored; NEXORA records only the confirmation timestamp and verification method.</p>
          <form onSubmit={verifyAge} className="mt-7 space-y-4">
            <label className="block text-xs font-semibold text-white/80" htmlFor="nexora-dob">Date of birth</label>
            <input id="nexora-dob" type="date" required max={new Date().toISOString().slice(0,10)} value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className="w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-white [color-scheme:dark]" />
            <label className="flex items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-3.5 text-xs leading-relaxed text-white/80">
              <input type="checkbox" required className="mt-0.5 accent-lime" />
              I confirm that this date of birth is accurate and that I am at least 18 years old.
            </label>
            {ageError && <p role="alert" className="text-xs text-rose">{ageError}</p>}
            <button type="submit" disabled={ageBusy || !dateOfBirth} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
              {ageBusy ? <LoaderCircle size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {ageBusy ? "Checking age…" : "Confirm and enter NEXORA"}
            </button>
          </form>
          <p className="mt-5 text-[11px] leading-relaxed text-dim">This is a date-of-birth self-declaration, not an identity-document or biometric age check. A stronger third-party age-assurance provider can be connected before launch.</p>
          <button type="button" onClick={signOut} className="btn-ghost mt-4 w-full justify-center text-xs">Sign out</button>
        </section>
      </main>
    );
  }

  const displayEmail = user.email || "NEXORA creator";
  const promptReady = prompt.trim().length >= 3;
  const providersReady = config.models.some((m) => m.ready);
  const visibleJobs = activeJob
    ? [activeJob, ...jobs.filter((job) => job.id !== activeJob.id)]
    : jobs;
  const filteredJobs = visibleJobs.filter((job) =>
    libraryFilter === "all" ? true :
    libraryFilter === "images" ? job.kind === "image" :
    libraryFilter === "videos" ? job.kind === "video" :
    Boolean(job.favorite)
  );
  const filterCounts: Record<LibraryFilter, number> = {
    all: visibleJobs.length,
    images: visibleJobs.filter((j) => j.kind === "image").length,
    videos: visibleJobs.filter((j) => j.kind === "video").length,
    favorites: visibleJobs.filter((j) => j.favorite).length,
  };
  const canExtend = Boolean(activeJob?.model_id
    ? config.models.find((m) => m.id === activeJob?.model_id)?.capabilities.videoExtend
    : false);

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-white/[.07] bg-[#0b101a] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 px-1 py-1">
            <Link href="/studio" aria-label="NEXORA home"><Logo /></Link>
            <span className="rounded-full border border-lime/20 bg-lime/[.08] px-2 py-1 text-[8px] font-bold uppercase tracking-[.15em] text-lime">Studio</span>
          </div>
          <p className="mb-2 mt-9 px-3 text-[9px] font-bold uppercase tracking-[.22em] text-dim">Workspace</p>
          <nav className="flex flex-row gap-1 overflow-x-auto scrollbar-none lg:flex-col" aria-label="Studio workspace">
            {[
              { href: "/studio", label: "Create", icon: WandSparkles, key: "create" },
              { href: "/studio/library", label: "Your library", icon: Library, key: "library" },
              { href: "/studio/credits", label: "Credits", icon: Zap, key: "credits" },
            ].map((item) => (
              <Link key={item.href} href={item.href} aria-current={view === item.key ? "page" : undefined} className={`group flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-[11px] font-semibold transition-all ${view === item.key ? "border-lime/20 bg-lime/[.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" : "border-transparent text-muted hover:border-white/10 hover:bg-white/[.045] hover:text-white"}`}>
                <item.icon size={15} className={view === item.key ? "text-lime" : "text-dim group-hover:text-lime"} /> {item.label}
              </Link>
            ))}
          </nav>
          <p className="mb-2 mt-8 px-3 text-[9px] font-bold uppercase tracking-[.22em] text-dim">Explore</p>
          <nav className="flex flex-row gap-1 overflow-x-auto scrollbar-none lg:flex-col" aria-label="NEXORA tools">
            {[
              { href: "/chat", label: "AI Chat", icon: MessageSquare },
              { href: "/tools", label: "Toolbox", icon: LayoutGrid },
              { href: "/tasks", label: "Tasks", icon: Library },
              { href: "/profile", label: "Profile", icon: ShieldCheck },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-[11px] font-semibold text-muted transition-all hover:border-white/10 hover:bg-white/[.045] hover:text-white">
                <item.icon size={15} className="text-dim group-hover:text-cyan" /> {item.label}
              </Link>
            ))}
            {role === "admin" && <Link href="/studio/admin" aria-current={view === "admin" ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-[11px] font-semibold ${view === "admin" ? "border-lime/20 bg-lime/[.08] text-lime" : "border-transparent text-muted hover:bg-white/[.045]"}`}><ShieldCheck size={15}/> Admin controls</Link>}
          </nav>
          <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/[.035] p-4 lg:block">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-dim">Credit balance</p>
              <Zap size={13} className="text-lime" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-white">{credits === null ? "—" : credits.toLocaleString()}</p>
            <Link href="/studio/credits" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan hover:underline">View usage <ArrowUpRight size={11}/></Link>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[.09] bg-white/[.035] px-3 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lime/30 to-cyan/25 text-xs font-bold text-white">{displayEmail.slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-white/85">{displayEmail}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[9px] uppercase tracking-[.12em] text-dim"><ShieldCheck size={9} className="text-mint"/>{role === "admin" ? "Administrator" : "Member"}</p>
            </div>
            <button type="button" onClick={signOut} className="btn-ghost !p-2" aria-label="Sign out"><LogOut size={13}/></button>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[62px] items-center justify-between gap-3 border-b border-white/[.07] bg-[#0a0f19] px-4 sm:px-7">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted"><span className="text-white/90">{tool ? "Tools" : "Workspace"}</span><span className="text-white/20">/</span><span className="text-lime">{tool ? tool.name : view === "create" ? "Create" : view === "library" ? "Your library" : view === "credits" ? "Credits" : "Admin controls"}</span></div>
          <div className="flex items-center gap-2">
            {providersReady ? <span className="pill border-mint/25 bg-mint/10 text-mint"><span className="dot-live"/> Providers configured</span> : <span className="pill border-amber/25 bg-amber/10 text-amber"><AlertTriangle size={11}/> Providers need setup</span>}
            {config.sensitiveEnabled && sensitive && <span className="pill border-rose/25 bg-rose/10 text-rose"><ShieldAlert size={11}/> 18+ mode</span>}
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1400px] px-5 pb-12 pt-6 sm:px-5 sm:pt-8">
          <div id="create" className="mb-6 flex flex-wrap items-end justify-between gap-4 scroll-mt-24">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-lime">{tool ? (tool.category === "Images" ? "Image tool" : "Video tool") : view === "create" ? "Creative workspace" : view === "library" ? "Your creations" : view === "credits" ? "Account" : "Management"}</p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-[32px]">{tool ? <>Create with <span className="gradient-text">{tool.name}.</span></> : view === "create" ? <>Create something <span className="gradient-text">remarkable.</span></> : view === "library" ? <>Your creative <span className="gradient-text">library.</span></> : view === "credits" ? <>Credits & <span className="gradient-text">usage.</span></> : <>Studio <span className="gradient-text">admin.</span></>}</h1>
              <p className="mt-1.5 text-xs text-muted">{tool ? tool.desc : view === "create" ? "Images, motion and visual ideas — all in one focused space." : view === "library" ? "All your generated images and videos, in one place." : view === "credits" ? "Track your balance and understand generation costs." : "Manage member credit balances."}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] px-3 py-2 text-[10px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-mint"/>{displayEmail}</div>
          </div>

          {tool && (
            <div className="mb-6 grid gap-2 sm:grid-cols-4">
              {tool.steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[9px] font-bold text-lime">{index + 1}</span>
                  <p className="text-[10px] font-medium text-muted">{step}</p>
                </div>
              ))}
            </div>
          )}

          <div className={view === "create" ? "mt-8 grid gap-6 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]" : "mt-2"}>
            {/* ============================ compose column ============================ */}
            {view === "create" && (<form onSubmit={generate} className="space-y-5">
              {!tool && (
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-panel p-1.5" role="group" aria-label="Generation type">
                {(["image", "video"] as const).map((value) => {
                  const active = kind === value;
                  const Icon = value === "image" ? ImageIcon : Film;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        if (value === kind) return;
                        setKind(value);
                        setModelId("");
                        clearEnd();
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold capitalize transition-colors",
                        active ? "bg-white/[0.09] text-white shadow-inner" : "text-muted hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      <Icon size={15} className={active ? "text-lime" : "text-dim"} />
                      {value} generation
                    </button>
                  );
                })}
              </div>

              )}

              {/* Image and Prompt */}
              <div className="glass-strong rounded-3xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime/12 text-lime">
                      {isVideo ? <Film size={15} /> : <ImageIcon size={15} />}
                    </span>
                    <h2 className="font-display text-base font-semibold text-white/95">
                      {isVideo ? "Image and Prompt" : "Image Generation"}
                    </h2>
                  </div>
                  {caps?.startEndFrame && (
                    <button
                      type="button"
                      onClick={() => (endEnabled ? clearEnd() : setEndEnabled(true))}
                      className={cn("pill cursor-pointer", endEnabled ? "border-lime/40 bg-lime/15 text-white" : "")}
                    >
                      Add End Frame
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[10px] text-dim">
                  JPEG / PNG / WebP files up to {config.maxUploadMb}MB
                </p>

                {(isVideo ? caps?.imageToVideo : caps?.referenceImage) ? (
                  <div className="mt-3">
                    {referenceFile || selectedReferenceAssetPath ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.03] p-3">
                        <Image
                          src={referencePreview || ""}
                          alt="Selected input"
                          width={72}
                          height={72}
                          unoptimized
                          className="h-[72px] w-[72px] rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white/85">{referenceFile?.name || "Generated NEXORA image"}</p>
                          <p className="mt-0.5 text-[10px] text-dim">{referenceFile ? `${(referenceFile.size / 1024 / 1024).toFixed(2)} MB · ready` : "Saved image · ready for video"}</p>
                        </div>
                        <button type="button" onClick={clearReference} className="btn-ghost !p-2" aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="reference-image"
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-4 py-7 text-center transition-colors hover:border-lime/35"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime/10 text-lime">
                          <UploadCloud size={17} />
                        </span>
                        <span className="text-xs font-semibold text-white/80">
                          {isVideo ? (tool?.needsReference ? "Start frame (required)" : "Start frame (optional)") : (tool?.needsReference ? "Reference image (required)" : "Reference image (optional)") }
                        </span>
                        <span className="text-[10px] text-dim">Click / Drop / Paste</span>
                        <input
                          id="reference-image"
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            setReferenceFile(file);
                            setSelectedReferenceAssetPath(null);
                            setReferencePreview(file ? URL.createObjectURL(file) : null);
                            if (file) {
                              const compatible = modelsForKind.find(
                                (candidate) =>
                                  candidate.ready &&
                                  (kind === "video"
                                    ? candidate.capabilities.imageToVideo
                                    : candidate.capabilities.referenceImage)
                              );
                              if (compatible) {
                                setModelId(compatible.id);
                                setMessage({
                                  type: "info",
                                  text: `Switched to ${compatible.label}, which accepts reference images.`,
                                });
                              } else {
                                setMessage({
                                  type: "error",
                                  text: "No configured image model currently accepts reference images. Your upload is preserved; configure a compatible image-editing provider to continue.",
                                });
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}

                    {endEnabled && (
                      <div className="mt-3">
                        {endFile ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.03] p-3">
                            <Image
                              src={endPreview || ""}
                              alt="Selected end frame"
                              width={56}
                              height={56}
                              unoptimized
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                            <p className="flex-1 truncate text-xs text-white/85">{endFile.name}</p>
                            <button type="button" onClick={clearEnd} className="btn-ghost !p-2" aria-label="Remove end frame">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="end-image"
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-4 py-4 text-xs text-muted hover:border-lime/35"
                          >
                            <Plus size={15} className="text-lime" /> End frame image
                            <input
                              id="end-image"
                              ref={endInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                setEndFile(file);
                                setEndPreview(file ? URL.createObjectURL(file) : null);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-[10px] text-dim">
                    {isVideo ? `${currentModel?.label} is a text-to-video model — reference images are not supported.` : `${currentModel?.label} is a text-to-image model — reference editing is not supported.`}
                  </p>
                )}
              </div>

              {/* Prompt */}
              <div className="glass-strong rounded-3xl p-6">
                <h2 className="font-display text-base font-semibold text-white/95">
                  Prompt
                </h2>
                <div className="relative mt-3">
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value.slice(0, 2500))}
                    maxLength={2500}
                    rows={5}
                    placeholder="A cinematic editorial portrait, soft directional light, rich natural textures, shot on medium format…"
                    className="field resize-y leading-relaxed"
                  />
                  {prompt && (
                    <button
                      type="button"
                      onClick={() => setPrompt("")}
                      className="absolute right-3 top-3 btn-ghost !p-1"
                      aria-label="Clear prompt"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={enhancePrompt} disabled={assistBusy || prompt.trim().length < 1} className="pill cursor-pointer hover:border-lime/40">
                      {assistBusy ? <LoaderCircle size={11} className="animate-spin" /> : <WandSparkles size={11} />}
                      {assistBusy ? "Enhancing…" : "Enhance prompt"}
                    </button>
                    <button type="button" onClick={() => setPresetOpen((v) => !v)} className="pill cursor-pointer hover:border-lime/40">
                      <Sparkles size={11} /> Inspiration
                    </button>
                  </div>
                  <span className="text-[10px] text-dim">{prompt.length}/2500</span>
                </div>
                {presetOpen && (
                  <div className="mt-3 space-y-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.slice(0, 30)}
                        type="button"
                        onClick={() => { setPrompt(preset); setPresetOpen(false); }}
                        className="block w-full rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-left text-[11px] leading-relaxed text-muted hover:border-lime/35 hover:text-white/85"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-dim">Be specific about lighting, composition, camera and mood.</p>
              </div>

              {/* Settings */}
              <div className="glass-strong rounded-3xl p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan/12 text-cyan"><Gauge size={15} /></span>
                  <h2 className="font-display text-base font-semibold text-white/95">Setting</h2>
                </div>

                {/* Duration (video only) */}
                {isVideo && (
                  <div className="mt-5">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/80">
                      <Timer size={12} className="text-lime" /> Duration
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10].map((value) => {
                        const enabled = currentModel ? currentModel.durations.includes(value) : true;
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!enabled}
                            onClick={() => setDuration(value)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-[11px] font-semibold transition-all duration-200",
                              duration === value
                                ? "border-lime/50 bg-lime/15 text-white"
                                : "border-line bg-white/[0.02] text-muted hover:border-white/20 hover:text-white",
                              !enabled && "cursor-not-allowed opacity-35"
                            )}
                          >
                            {value}s
                          </button>
                        );
                      })}
                    </div>
                    {currentModel && !currentModel.capabilities.directDuration && isVideo && (
                      <p className="mt-1.5 text-[9px] text-dim">Duration conditions the prompt for this model.</p>
                    )}
                  </div>
                )}

                {/* Resolution */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-white/80">Resolution</p>
                  <div className="flex flex-wrap gap-2">
                    {["480p", "720p", "1080p"].map((value) => {
                      const enabled = currentModel ? currentModel.resolutions.includes(value) : true;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!enabled}
                          onClick={() => setResolution(value)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-[11px] font-semibold transition-all duration-200",
                            resolution === value
                              ? "border-lime/50 bg-lime/15 text-white"
                              : "border-line bg-white/[0.02] text-muted hover:border-white/20 hover:text-white",
                            !enabled && "cursor-not-allowed opacity-35"
                          )}
                        >
                          {currentModel?.provider === "gemini-image" && value === "1080p" ? "1K" : value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-white/80">Aspect ratio</p>
                  <div className="flex flex-wrap gap-2">
                    {(currentModel?.provider === "gemini-video" ? ["16:9", "9:16"] : ASPECTS).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAspect(value)}
                        className={cn(
                          "rounded-full border px-3.5 py-2 text-[11px] font-semibold transition-all duration-200",
                          aspect === value
                            ? "border-lime/50 bg-lime/15 text-white"
                            : "border-line bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creativity slider */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>Creativity</span>
                    <span className="text-[10px] font-normal text-dim">{guidance <= 4 ? "loose interpretation" : guidance >= 8 ? "strict prompt adherence" : "balanced"}</span>
                    <span>Relevance</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={guidance}
                    onChange={(event) => setGuidance(Number(event.target.value))}
                    className="mt-2.5 w-full accent-lime"
                    aria-label="Creativity versus relevance"
                  />
                </div>

                {/* Camera */}
                <label className="mt-6 block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/80">
                    <Camera size={12} className="text-lime" /> Camera movement
                    {!isVideo && <span className="text-[9px] font-normal text-dim">— disabled in image generation</span>}
                  </span>
                  <div className="relative">
                    <select
                      value={camera}
                      disabled={!isVideo}
                      onChange={(event) => setCamera(event.target.value)}
                      className="field appearance-none pr-10 disabled:opacity-40"
                    >
                      {CAMERAS.map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dim" />
                  </div>
                </label>

                {/* Audio + sensitive */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Volume2 size={14} className={caps?.audio ? "text-cyan" : "text-dim"} />
                      <div>
                        <p className="text-xs font-semibold text-white/85">Synchronized audio</p>
                        <p className="text-[9px] text-dim">
                          {caps?.audio ? `${currentModel?.label} generates A/V-synced output` : "This model produces silent video"}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "rounded-full border px-3 py-1.5 text-[10px] font-semibold",
                      caps?.audio ? "border-cyan/25 bg-cyan/10 text-cyan" : "border-line bg-white/[0.02] text-dim"
                    )}>
                      {caps?.audio ? "Audio output supported" : "Silent video"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert size={14} className={sensitive ? "text-rose" : "text-dim"} />
                      <div>
                        <p className="text-xs font-semibold text-white/85">Sensitive content · 18+</p>
                        <p className="text-[9px] text-dim">
                          {config.sensitiveEnabled ? "Requires the consent gate on every run" : "Disabled on this deployment"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={sensitive}
                      disabled={!config.sensitiveEnabled}
                      onClick={() => {
                        if (sensitive) {
                          setSensitive(false);
                        } else if (sensitiveConsent) {
                          setSensitive(true);
                        } else {
                          setGateOpen(true);
                        }
                      }}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors duration-200",
                        sensitive ? "bg-rose" : "bg-white/12",
                        !config.sensitiveEnabled && "cursor-not-allowed opacity-40"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200",
                        sensitive ? "translate-x-[22px]" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Generate bar */}
              <div className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-white">
                    <Zap size={14} className="text-cyan" /> {cost} credit{cost === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-[10px] text-dim">
                    {isVideo ? `${config.videoCreditCost} per 5s` : "per image"}
                    {" · "}reserved on submit, refunded on failure
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={busy || !promptReady || !currentModel}
                  className="btn-primary min-w-[190px]"
                >
                  {busy ? (
                    <><LoaderCircle size={16} className="animate-spin" /> Submitting…</>
                  ) : (
                    <>Generate <ArrowUpRight size={16} /></>
                  )}
                </button>
              </div>

              {!providersReady && (
                <p className="rounded-xl border border-amber/25 bg-amber/8 px-4 py-3 text-[11px] leading-relaxed text-amber">
                  Gemini generation is not configured for this deployment yet. Add a valid GEMINI_API_KEY
                  with image/video generation access in Render environment settings. NEXORA will not
                  display sample media or pretend a generation succeeded.
                </p>
              )}
            </form>)}

            {/* ============================= preview column ============================ */}
            {view === "create" && (<div className="min-w-0 space-y-8">
              {message && (
                <p className={cn(
                  "rounded-xl border px-4 py-3 text-xs leading-relaxed",
                  message.type === "error"
                    ? "border-rose/25 bg-rose/10 text-rose"
                    : "border-mint/25 bg-mint/10 text-mint"
                )}>
                  {message.text}
                </p>
              )}

              {activeJob ? (
                <JobView
                  job={activeJob}
                  canExtend={canExtend}
                  onFavorite={(job) => void patchJob(job, { favorite: !job.favorite })}
                  onRate={(job, rating) => void patchJob(job, { rating })}
                  onExtend={(job) => void extend(job)}
                  onUseImage={useGeneratedImageAsVideoSource}
                />
              ) : (
                <div className="glass-strong rounded-3xl">
                  <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">Preview</span>
                      <span className="pill border-white/12 bg-white/5 text-white/60">Idle</span>
                    </div>
                  </div>
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 px-8 py-14 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-3xl border border-lime/25 bg-lime/8 text-lime">
                      <Sparkles size={26} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-white/95">Your result lands here</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                        Describe your vision and hit Generate. The preview will show the real provider output when the job completes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>)}
          </div>

          {view === "library" && (
            <section className="glass-strong rounded-3xl p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-lime">Your work</p><h2 className="mt-2 font-display text-xl font-semibold text-white/95">Recent generations</h2></div>
                <span className="text-[10px] uppercase tracking-[.18em] text-dim">{jobs.length} record{jobs.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-4"><LibraryTabs value={libraryFilter} onChange={setLibraryFilter} counts={filterCounts} /></div>
              <div className="mt-5"><LibraryGrid jobs={filteredJobs} activeId={activeJob?.id ?? null} onSelect={setActiveJob} /></div>
              {activeJob && <div className="mt-6"><JobView job={activeJob} canExtend={canExtend} onFavorite={(job) => void patchJob(job, { favorite: !job.favorite })} onRate={(job, rating) => void patchJob(job, { rating })} onExtend={(job) => void extend(job)} /></div>}
            </section>
          )}
          {view === "credits" && <section className="glass-strong rounded-3xl p-5 sm:p-7"><CreditsPanel credits={credits} imageCost={config.imageCreditCost} videoCost={config.videoCreditCost} /></section>}
          {view === "admin" && role !== "admin" && <section className="glass rounded-3xl p-8 text-center"><ShieldAlert size={24} className="mx-auto text-amber" /><h2 className="mt-3 text-base font-semibold text-white">Administrator access required</h2><p className="mt-2 text-sm text-muted">This area is available only to authorized NEXORA administrators.</p></section>}
          {view === "admin" && role === "admin" && (
            <section className="glass-strong rounded-3xl p-5 sm:p-7">
              <AdminPanel users={adminUsers} busy={adminBusy} onSubmit={adjustCredits} />
              {adminMessage && <p className={cn("mt-4 rounded-xl border px-4 py-3 text-xs", adminMessage.includes("applied") ? "border-mint/25 bg-mint/10 text-mint" : "border-rose/25 bg-rose/10 text-rose")}>{adminMessage}</p>}
            </section>
          )}

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[10px] uppercase tracking-[0.16em] text-dim">
            <span className="font-display font-bold tracking-[0.22em] text-lime/80">NEXORA</span>
            <span>Real models. Real work. No placeholders.</span>
            <span>© {new Date().getFullYear()}</span>
          </footer>
        </div>
      </section>

      {gateOpen && (
        <SensitiveGate
          onCancel={() => setGateOpen(false)}
          onAccept={() => {
            setSensitiveConsent(true);
            setSensitive(true);
            setGateOpen(false);
            setMessage({ type: "info", text: "Sensitive mode enabled for this session. The consent is sent with every sensitive run." });
          }}
        />
      )}
    </main>
  );
}
