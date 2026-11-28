import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { TemplatesClient } from "./templates-client";

export const metadata: Metadata = {
  title: "Templates — NEXORA AI",
  description:
    "Start from a preset: cinematic, fashion, glamour, romance, fitness, fantasy and product templates that open real tools with real prompts. No templates based on real people.",
};

export default function TemplatesPage() {
  return (
    <>
      <Navbar />
      <TemplatesClient />
      <Footer />
    </>
  );
}
