"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot, CheckCircle2, Cpu, LoaderCircle, MessageSquare,
  Send, ShieldCheck, Sparkles,
} from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string; via?: string; detail?: string };

type Engines = {
  gemini?: boolean;
  omega?: boolean;
  venice?: boolean;
};

const VIA_LABEL: Record<string, string> = {
  gemini: "Google Gemini",
  omega: "Omega AI hosted",
  venice: "Venice.ai hosted",
};

export function ChatClient({ initialPrompt = "", initialCharacterId = "" }: { initialPrompt?: string; initialCharacterId?: string }) {
  const [characterId] = useState(initialCharacterId);
  const [characterName, setCharacterName] = useState("");
  const [engines, setEngines] = useState<Engines>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "signed-out" | "age-required" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (initialCharacterId) {
        try {
          const characterResponse = await fetch("/api/characters", { cache: "no-store" });
          const characterPayload = await characterResponse.json();
          const character = (characterPayload.characters || []).find((item: { id: string; name: string }) => item.id === initialCharacterId);
          if (!cancelled && character) setCharacterName(character.name);
        } catch { /* character label is optional; server validates ownership on send */ }
      }
      try {
        const configResponse = await fetch("/api/config", { cache: "no-store" });
        const config = await configResponse.json();
        if (cancelled) return;
        setEngines(config.engines ?? {});
      } catch { /* engine list stays empty — shown honestly */ }

      const accessResponse = await fetch("/api/generations?limit=1", { cache: "no-store" });
      if (cancelled) return;
      if (accessResponse.status === 401) { setAuthState("signed-out"); return; }
      if (accessResponse.status === 403) { setAuthState("age-required"); return; }
      if (!accessResponse.ok) throw new Error("Could not verify account access.");
      setAuthState("ready");
    })();
    return () => { cancelled = true; };
  }, [initialCharacterId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = useCallback(async () => {
    const content = input.trim();
    if (!content || busy) return;
    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: characterId || undefined,
          messages: nextMessages
            .filter((message) => message.role === "user" || message.role === "assistant")
            .map((message) => ({ role: message.role, content: message.content })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.code === "AGE_VERIFICATION_REQUIRED") { setAuthState("age-required"); return; }
        if (response.status === 401) { setAuthState("signed-out"); return; }
        throw new Error(payload.error || "The chat request failed.");
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: String(payload.text || ""), via: payload.via, detail: payload.detail },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The chat request failed.");
    } finally {
      setBusy(false);
    }
  }, [busy, input, messages, characterId]);

  const selectedLabel = engines.gemini ? "Google Gemini · automatic" : engines.omega ? "Omega AI · automatic" : engines.venice ? "Venice AI · automatic" : "AI assistant";

  return (
    <main className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* ------------------------------- sidebar ------------------------------ */}
      <aside className="space-y-5">
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-dim">
            <Cpu size={12} className="text-lime" /> Engine chain
          </p>
          <ul className="mt-3 space-y-2 text-[11px]">
            <li className="flex items-center gap-2">
              {engines.gemini ? (
                <><CheckCircle2 size={13} className="text-mint" /><span className="text-white/85">Gemini hosted — configured</span></>
              ) : (
                <><Sparkles size={13} className="text-dim" /><span className="text-muted">Gemini hosted — not configured</span></>
              )}
            </li>
            <li className="flex items-center gap-2">
              {engines.omega ? (
                <><CheckCircle2 size={13} className="text-mint" /><span className="text-white/85">Omega AI fallback configured</span></>
              ) : (
                <><Sparkles size={13} className="text-dim" /><span className="text-muted">Omega AI fallback not configured</span></>
              )}
            </li>
            <li className="flex items-center gap-2">
              {engines.venice ? (
                <><CheckCircle2 size={13} className="text-mint" /><span className="text-white/85">Venice fallback configured</span></>
              ) : (
                <><ShieldCheck size={13} className="text-dim" /><span className="text-muted">Venice fallback not configured</span></>
              )}
            </li>
          </ul>
          <p className="mt-3 border-t border-line pt-3 text-[10px] leading-relaxed text-dim">
            Messages use Gemini first when configured, with only the connected hosted fallbacks shown above.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-dim">
            <MessageSquare size={12} className="text-lime" /> Automatic routing
          </p>
          <p className="mt-3 text-sm font-semibold text-white/90">{selectedLabel}</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted">NEXORA chooses the available connected engine automatically. There is nothing to select.</p>
        </div>
      </aside>

      {/* -------------------------------- thread ------------------------------ */}
      <section className="flex min-h-[60vh] flex-col rounded-2xl border border-line bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">
            Chat <span className="mx-1.5 text-white/20">/</span>
            <span className="text-white/80">{characterName ? "Character · " + characterName : selectedLabel}</span>
          </p>
          {(engines.gemini || engines.omega || engines.venice) && <span className="pill border-lime/25 bg-lime/10 text-lime"><Bot size={11} /> Connected</span>}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6" style={{ maxHeight: "62vh" }}>
          {authState === "loading" && (
            <p className="py-10 text-center text-xs text-dim">Checking engines…</p>
          )}

          {authState === "signed-out" && (
            <div className="py-14 text-center">
              <MessageSquare size={28} className="mx-auto text-lime" />
              <p className="mt-4 text-sm font-semibold text-white">Sign in to use AI Chat</p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
                Chat uses the connected hosted inference service. Sign in and complete the 18+ check to start.
              </p>
              <Link href="/sign-in" className="btn-primary mt-5 inline-flex !px-5 !py-2.5 text-xs">Sign in</Link>
            </div>
          )}

          {authState === "age-required" && (
            <div className="py-14 text-center">
              <ShieldCheck size={28} className="mx-auto text-amber" />
              <p className="mt-4 text-sm font-semibold text-white">18+ verification required</p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
                Adults only. Open the studio to complete NEXORA&apos;s age verification, then come back to chat.
              </p>
              <Link href="/studio" className="btn-primary mt-5 inline-flex !px-5 !py-2.5 text-xs">Open studio</Link>
            </div>
          )}

          {authState === "ready" && messages.length === 0 && (
            <div className="py-14 text-center">
              <Sparkles size={26} className="mx-auto text-lime" />
              <p className="mt-4 text-sm font-semibold text-white">Your creative assistant.</p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted">
                Ask for help with prompts, ideas or creative planning. NEXORA routes the request automatically.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                  message.role === "user"
                    ? "bg-lime/15 text-white"
                    : "border border-line bg-white/[0.03] text-white/90"
                }`}
              >
                {message.content}
                {message.role === "assistant" && message.via && (
                  <span className="mt-2 block text-[9px] uppercase tracking-[0.14em] text-dim">
                    via {VIA_LABEL[message.via] || message.via}{message.detail ? ` · ${message.detail}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-xs text-muted">
                <LoaderCircle size={13} className="animate-spin text-lime" />
                Running inference…
              </div>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        {error && (
          <div className="mx-5 mb-3 rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-[11px] leading-relaxed text-rose">
            {error}
          </div>
        )}

        {authState === "ready" && (
          <div className="border-t border-line p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="Message the assistant… (Enter to send, Shift+Enter for a new line)"
                className="field min-h-[52px] flex-1 resize-y"
              />
              <button type="button" onClick={() => void send()} disabled={busy || !input.trim()} className="btn-primary !px-4 !py-3">
                {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
