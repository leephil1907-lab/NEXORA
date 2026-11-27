"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Check, CircleAlert, LoaderCircle, Lock, Mail, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/browser";

function safeNext(value: string | null): string {
  if (!value) return "/studio";
  if (!value.startsWith("/") || value.startsWith("//")) return "/studio";
  return value;
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next);
      else setChecking(false);
    });
  }, [supabase, next, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
    setBusy(false);
    if (otpError) setError(otpError.message);
    else setSent(true);
  }

  return (
    <main className="relative min-h-screen">
      <div className="site-container grid min-h-screen items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20">
        {/* Brand panel */}
        <section className="hidden lg:block">
          <Logo />
          <h1 className="mt-12 font-display text-[clamp(2.6rem,4.5vw,3.9rem)] font-extrabold leading-[1.05] tracking-tight">
            Make the unreal,
            <br />
            <span className="gradient-text text-shadow-glow">real.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Sign in to your creative intelligence studio — real generative models,
            durable jobs, and storage you own. No placeholders, ever.
          </p>
          <ul className="mt-10 space-y-4">
            {[
              { icon: Sparkles, text: "Image and video generation through real model APIs" },
              { icon: Lock, text: "Private per-user media storage with signed access" },
              { icon: Mail, text: "Passwordless sign-in — one tap from your inbox" }
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lime/20 to-cyan/10 text-lime">
                  <item.icon size={17} />
                </span>
                <span className="pt-2 text-sm leading-relaxed text-muted">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Form panel */}
        <section className="mx-auto w-full max-w-[440px]">
          <div className="glass-strong rounded-[1.75rem] p-8 sm:p-10">
            <div className="lg:hidden">
              <Logo />
            </div>
            <p className="eyebrow mt-8 lg:mt-0">
              <span className="eyebrow-line" /> Welcome back
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">
              Sign in to NEXORA
            </h2>
            <p className="mt-2 text-sm text-muted">
              Enter your email and we&apos;ll send a secure sign-in link. New here? The link
              creates your account automatically.
            </p>

            {checking ? (
              <div className="mt-10 flex items-center gap-3 text-sm text-muted">
                <LoaderCircle size={16} className="animate-spin" /> Checking your session…
              </div>
            ) : !supabase ? (
              <div className="mt-8 rounded-2xl border border-amber/25 bg-amber/10 p-5">
                <p className="flex items-center gap-2.5 text-sm font-semibold text-amber">
                  <CircleAlert size={16} /> Authentication not configured
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  The Supabase connection is missing from this environment. Sign-in will work
                  as soon as the environment variables are configured.
                </p>
              </div>
            ) : sent ? (
              <div className="mt-8 rounded-2xl border border-mint/25 bg-mint/10 p-6">
                <p className="flex items-center gap-2.5 text-sm font-semibold text-mint">
                  <Check size={16} /> Check your inbox
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  We sent a sign-in link to <span className="text-white">{email}</span>.
                  It expires shortly and can only be used once.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs text-lime underline-offset-4 hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold text-white/80">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@studio.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="field"
                  />
                </div>
                <button type="submit" disabled={busy} className="btn-primary w-full">
                  {busy ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" /> Sending link…
                    </>
                  ) : (
                    <>
                      Continue with email <ArrowUpRight size={16} />
                    </>
                  )}
                </button>
                {error && (
                  <p className="flex items-start gap-2 rounded-xl border border-rose/25 bg-rose/10 px-4 py-3 text-xs text-rose">
                    <CircleAlert size={14} className="mt-0.5 shrink-0" /> {error}
                  </p>
                )}
              </form>
            )}

            <p className="mt-8 flex items-center gap-2 text-[11px] text-dim">
              <Lock size={12} /> Secure, passwordless authentication. No passwords stored.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-dim">
            By continuing you agree to our{" "}
            <a href="/legal/terms" className="text-lime underline-offset-4 hover:underline">Terms</a>{" "}
            and{" "}
            <a href="/legal/privacy" className="text-lime underline-offset-4 hover:underline">Privacy Policy</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
