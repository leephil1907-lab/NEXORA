import type { Metadata } from "next";
import { Suspense } from "react";
import { Workspace } from "@/components/studio/workspace";

export const metadata: Metadata = { title: "Studio Admin", description: "Manage NEXORA member credits." };

export default function StudioAdminPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm text-muted">Loading admin controls…</main>}><Workspace view="admin" /></Suspense>;
}
