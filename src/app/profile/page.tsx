"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight, Crown, ListChecks, LogOut, MessageSquareText, ShieldCheck,
  Sparkles, UserRound, WandSparkles, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

type ProfileRow = { credits: number | null; role: string | null; created_at: string | null };

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [generationCount, setGenerationCount] = useState<number | null>(null);
  const [state, setState] = useState<"loading" | "signed-out" | "ready">("loading");

  const load = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setState("signed-out");
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState("signed-out");
      return;
    }
    setEmail(user.email ?? "Signed in");
    setCreatedAt(user.created_at ?? null);
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("credits,role,created_at")
      .eq("id", user.id)
      .maybeSingle();
    if (profileRow) setProfile(profileRow as ProfileRow);
    const response = await fetch("/api/generations?limit=100", { cache: "no-store" });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.generations)) setGenerationCount(payload.generations.length);
    }
    setState("ready");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1000px] flex-1 px-5 py-9">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lime">
          <UserRound size={12} /> Profile
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
          Your <span className="gradient-text">account.</span>
        </h1>

        {state === "loading" && <p className="mt-10 text-sm text-dim">Loading account…</p>}

        {state === "signed-out" && (
          <div className="mt-8 rounded-[2rem] border border-line bg-panel p-10 text-center">
            <UserRound size={28} className="mx-auto text-lime" />
            <p className="mt-4 text-sm font-semibold text-white">Sign in to view your profile</p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
              Track your credits, review your tasks and manage your NEXORA account.
            </p>
            <Link href="/sign-in?next=%2Fprofile" className="btn-primary mt-5 inline-flex !px-5 !py-2.5 text-xs">
              Sign in
            </Link>
          </div>
        )}

        {state === "ready" && (
          <>
            <section className="mt-6 rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-lime/35 to-cyan/25 text-lg font-bold text-white">
                    {(email.slice(0, 1) || "N").toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{email}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-dim">
                      <ShieldCheck size={10} className="text-mint" />
                      {profile?.role === "admin" ? "Operator" : "Member"}
                      {createdAt ? ` · joined ${new Date(createdAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => void signOut()} className="btn-secondary inline-flex items-center gap-1.5 !px-4 !py-2 text-xs">
                  <LogOut size={12} /> Sign out
                </button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
                  <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-dim">
                    <Zap size={11} className="text-lime" /> Available credits
                  </p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-white">
                    {profile?.credits ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
                  <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-dim">
                    <ListChecks size={11} className="text-lime" /> Recent tasks
                  </p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-white">
                    {generationCount ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
                  <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-dim">
                    <Crown size={11} className="text-lime" /> Membership
                  </p>
                  <p className="mt-2 font-display text-xl font-extrabold text-white">
                    {profile?.role === "admin" ? "Operator" : "Standard"}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/tasks" className="group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-lime/35">
                <ListChecks size={17} className="text-lime" />
                <p className="mt-3 text-sm font-semibold text-white">Tasks</p>
                <p className="mt-1 text-[11px] text-muted">Review every generation and its status.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-lime">Open <ArrowUpRight size={11} /></span>
              </Link>
              <Link href="/credits" className="group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-lime/35">
                <Crown size={17} className="text-lime" />
                <p className="mt-3 text-sm font-semibold text-white">Upgrade</p>
                <p className="mt-1 text-[11px] text-muted">Credit plans, professional mode and rates.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-lime">Open <ArrowUpRight size={11} /></span>
              </Link>
              <Link href="/chat" className="group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-lime/35">
                <MessageSquareText size={17} className="text-lime" />
                <p className="mt-3 text-sm font-semibold text-white">Chat</p>
                <p className="mt-1 text-[11px] text-muted">Talk to the assistant behind your tools.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-lime">Open <ArrowUpRight size={11} /></span>
              </Link>
              <Link href="/studio" className="group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-lime/35">
                <WandSparkles size={17} className="text-lime" />
                <p className="mt-3 text-sm font-semibold text-white">Studio</p>
                <p className="mt-1 text-[11px] text-muted">The full creation workspace in one screen.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-lime">Open <ArrowUpRight size={11} /></span>
              </Link>
            </section>

            <p className="mt-6 flex items-center gap-2 text-[10px] text-dim">
              <Sparkles size={11} className="text-lime" />
              Credits are consumed only on real provider runs and refunded automatically on failure.
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
