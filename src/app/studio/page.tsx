import type { Metadata } from "next";
import { Suspense } from "react";
import { Workspace } from "@/components/studio/workspace";

export const metadata: Metadata = {
  title: "Studio",
  description: "Your NEXORA creation workspace — compose, generate, and manage real media."
};

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading studio…
        </main>
      }
    >
      <Workspace />
    </Suspense>
  );
}
