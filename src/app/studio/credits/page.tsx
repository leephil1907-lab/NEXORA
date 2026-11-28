import type { Metadata } from "next";
import { Suspense } from "react";
import { Workspace } from "@/components/studio/workspace";

export const metadata: Metadata = { title: "Credits & Usage", description: "View your NEXORA credit balance and generation costs." };

export default function StudioCreditsPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm text-muted">Loading credits…</main>}><Workspace view="credits" /></Suspense>;
}
