import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Workspace } from "@/components/studio/workspace";
import { TOOLS, getTool } from "@/lib/tools/registry";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found — NEXORA AI" };
  return {
    title: `${tool.name} — NEXORA AI`,
    description: tool.desc,
  };
}

/**
 * Dedicated tool page — the reference flow in full: input → configure →
 * generate → result → tasks, powered by the live generation engine.
 */
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading {tool.name}…
        </main>
      }
    >
      <Workspace view="create" tool={tool} />
    </Suspense>
  );
}
