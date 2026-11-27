import { Suspense } from "react";
import { Workspace } from "@/components/studio/workspace";

/**
 * Tool-first home: the site opens directly into the working studio —
 * upload, prompt, model, generate. No marketing landing page.
 */
export default function HomePage() {
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
