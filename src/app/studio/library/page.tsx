import type { Metadata } from "next";
import { Suspense } from "react";
import { Workspace } from "@/components/studio/workspace";

export const metadata: Metadata = { title: "Your Library", description: "Browse your NEXORA image and video generations." };

export default function StudioLibraryPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm text-muted">Loading library…</main>}><Workspace view="library" /></Suspense>;
}
