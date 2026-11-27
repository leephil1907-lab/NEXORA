"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Laptop, LoaderCircle, Plus, RefreshCw, ShieldCheck, Smartphone, Trash2, Wifi } from "lucide-react";

type Device = { id: string; name: string; platform: string; status: "active" | "revoked"; last_seen_at: string | null; created_at: string };
type LocalRequest = { id: string; status: "queued" | "running" | "completed" | "failed" | "expired"; output?: string | null; error_message?: string | null; created_at?: string };

export default function LocalCompanionPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState("My Android phone");
  const [platform, setPlatform] = useState("android");
  const [token, setToken] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [request, setRequest] = useState<LocalRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDevices = useCallback(async () => {
    const response = await fetch("/api/local/devices", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not load devices.");
    setDevices(payload.devices ?? []);
    if (!deviceId && payload.devices?.some((item: Device) => item.status === "active")) {
      setDeviceId(payload.devices.find((item: Device) => item.status === "active").id);
    }
  }, [deviceId]);

  useEffect(() => {
    loadDevices().catch((e) => setError(e instanceof Error ? e.message : "Could not load devices."));
  }, [loadDevices]);

  useEffect(() => {
    if (!request || !["queued", "running"].includes(request.status)) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch(`/api/local/requests/${request.id}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not check local request.");
        if (!active) return;
        setRequest(payload.request);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Status check failed.");
      }
      if (active) timer = setTimeout(poll, 2500);
    };
    timer = setTimeout(poll, 1800);
    return () => { active = false; clearTimeout(timer); };
  }, [request?.id, request?.status]);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice(""); setToken("");
    try {
      const response = await fetch("/api/local/devices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, platform }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Device registration failed.");
      setToken(payload.token); setDeviceId(payload.device.id);
      setNotice("Device registered. Copy the token now; NEXORA will not show it again.");
      await loadDevices();
    } catch (e) { setError(e instanceof Error ? e.message : "Device registration failed."); }
    finally { setBusy(false); }
  }

  async function revoke(id: string) {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/local/devices/${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not revoke device.");
      if (deviceId === id) setDeviceId("");
      setNotice("Device revoked. Its queued work has been expired.");
      await loadDevices();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not revoke device."); }
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setRequest(null);
    try {
      const response = await fetch("/api/local/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, prompt, maxTokens: 512, temperature: 0.7 }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not queue local request.");
      setRequest(payload.request); setPrompt("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not queue local request."); }
    finally { setBusy(false); }
  }

  async function copyToken() {
    try { await navigator.clipboard.writeText(token); setNotice("Device token copied."); }
    catch { setError("Clipboard access failed. Select and copy the token manually."); }
  }

  const activeDevices = devices.filter((item) => item.status === "active");
  const statusLabel = request?.status === "running" ? "Running on your device" : request?.status === "queued" ? "Waiting for companion" : request?.status === "completed" ? "Completed" : request?.status === "failed" ? "Failed" : request?.status === "expired" ? "Expired" : "";

  return (
    <main className="min-h-screen px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"><ArrowLeft size={16} /> Back to Studio</Link>
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan"><Wifi size={23} /></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan">NEXORA · Local inference</p><h1 className="mt-1 font-display text-3xl font-bold">Local companion</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Connect a local GGUF model running on your Android phone or computer. NEXORA sends requests through a secure outbound connection; your device never needs an open public port.</p></div>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-rose/25 bg-rose/10 px-4 py-3 text-xs text-rose">{error}</p>}
        {notice && <p role="status" className="mt-6 rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3 text-xs text-cyan">{notice}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="glass-strong rounded-3xl p-6">
            <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-cyan" /><h2 className="font-semibold">Register a device</h2></div>
            <p className="mt-2 text-xs leading-relaxed text-muted">Create a unique credential for each device. You can revoke it at any time.</p>
            <form onSubmit={register} className="mt-5 space-y-3">
              <label className="block text-xs text-muted">Device name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required className="field mt-2 w-full" /></label>
              <label className="block text-xs text-muted">Platform<select value={platform} onChange={(e) => setPlatform(e.target.value)} className="field mt-2 w-full"><option value="android">Android / Termux</option><option value="linux">Linux</option><option value="windows">Windows</option><option value="macos">macOS</option><option value="other">Other</option></select></label>
              <button type="submit" disabled={busy || !name.trim()} className="btn-primary w-full">{busy ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />} Register device</button>
            </form>
            {token && <div className="mt-5 rounded-2xl border border-amber/25 bg-amber/5 p-4">
              <p className="text-xs font-semibold text-amber">One-time device token</p>
              <p className="mt-2 break-all font-mono text-[11px] text-white/80">{token}</p>
              <button type="button" onClick={copyToken} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:bg-white/5"><Copy size={13} /> Copy token</button>
              <p className="mt-2 text-[10px] leading-relaxed text-muted">Store it privately. It will not be displayed again.</p>
            </div>}
          </section>

          <section className="glass-strong rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Smartphone size={17} className="text-lime" /><h2 className="font-semibold">Your devices</h2></div><button type="button" onClick={() => loadDevices().catch((e) => setError(e.message))} className="btn-ghost !p-2" aria-label="Refresh devices"><RefreshCw size={14} /></button></div>
            <div className="mt-4 space-y-3">
              {devices.length === 0 ? <p className="rounded-xl border border-line p-4 text-xs text-muted">No local devices registered yet.</p> : devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{device.name}</p><p className="mt-1 text-[10px] text-muted">{device.platform} · {device.last_seen_at ? `Last seen ${new Date(device.last_seen_at).toLocaleString()}` : "Not connected yet"}</p><p className={`mt-1 text-[10px] ${device.status === "active" ? "text-cyan" : "text-muted"}`}>{device.status}</p></div>
                  {device.status === "active" && <button type="button" onClick={() => revoke(device.id)} className="btn-ghost !p-2 text-rose" aria-label={`Revoke ${device.name}`}><Trash2 size={14} /></button>}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-muted">{activeDevices.length}/5 active devices. Device tokens are never included in this list.</p>
          </section>
        </div>

        <section className="glass-strong mt-6 rounded-3xl p-6">
          <div className="flex items-center gap-2"><Laptop size={17} className="text-lime" /><h2 className="font-semibold">Run a local text request</h2></div>
          <p className="mt-2 text-xs leading-relaxed text-muted">Choose a connected device. The companion must be running and its local model API must be available before submitting.</p>
          <form onSubmit={submitPrompt} className="mt-5 space-y-3">
            <label className="block text-xs text-muted">Target device<select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} required className="field mt-2 w-full"><option value="">Select a registered device</option>{activeDevices.map((device) => <option key={device.id} value={device.id}>{device.name} ({device.platform})</option>)}</select></label>
            <label className="block text-xs text-muted">Prompt<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={8000} required rows={4} placeholder="Ask your local model something…" className="field mt-2 w-full resize-y" /></label>
            <button type="submit" disabled={busy || !deviceId || !prompt.trim()} className="btn-primary" >{busy ? <LoaderCircle size={15} className="animate-spin" /> : <Wifi size={15} />} Send to local model</button>
          </form>
          {request && <div className="mt-5 rounded-2xl border border-line bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{statusLabel}</p><span className="text-[10px] uppercase tracking-wider text-muted">{request.status}</span></div>
            {["queued","running"].includes(request.status) && <p className="mt-2 flex items-center gap-2 text-xs text-muted"><LoaderCircle size={13} className="animate-spin" /> Waiting for the local companion to return a real response.</p>}
            {request.status === "completed" && <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-white/85">{request.output}</pre>}
            {(request.status === "failed" || request.status === "expired") && <p className="mt-3 text-xs text-rose">{request.error_message || "The request did not complete."}</p>}
          </div>}
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold">Android / Termux setup</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-muted">
            <li>Start Uncensored Local AI and enable its local OpenAI-compatible API at <code className="text-cyan">127.0.0.1:4891</code>.</li>
            <li>Register this phone above and copy its one-time token.</li>
            <li>Download <code className="text-cyan">scripts/nexora-local-agent.mjs</code> from the NEXORA repository.</li>
            <li>In Termux, install Node.js with <code className="text-cyan">pkg install nodejs</code>.</li>
            <li>Set <code className="text-cyan">NEXORA_URL</code>, <code className="text-cyan">NEXORA_DEVICE_TOKEN</code>, and <code className="text-cyan">LOCAL_LLM_URL</code>, then run <code className="text-cyan">node nexora-local-agent.mjs</code>.</li>
          </ol>
          <Link href="https://github.com/leephil1907-lab/NEXORA/blob/feat/nexora-secure-local-companion/docs/local-companion.md" target="_blank" className="mt-4 inline-flex text-xs font-semibold text-cyan hover:underline">Read complete setup guide ↗</Link>
        </section>
        <p className="mt-6 text-center text-[10px] text-dim">Local companion currently supports text inference only. Cloud image/video generation and virtual try-on remain on their existing providers.</p>
      </div>
    </main>
  );
}
