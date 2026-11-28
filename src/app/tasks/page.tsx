import { Suspense } from "react";
import type { Metadata } from "next";
import { Workspace } from "@/components/studio/workspace";

export const metadata: Metadata = {
  title: "Tasks — NEXORA AI",
  description: "Your recent generations — every image and video job, live status and results.",
};

/** Tasks — the reference sites' recent-task screen, backed by real job history. */
export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading tasks…
        </main>
      }
    >
      <Workspace view="library" />
    </Suspense>
  );
}
