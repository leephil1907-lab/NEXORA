import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ModelsBrowser } from "./models-client";
import { publicLlmCatalog } from "@/lib/models/uncensored-catalog";
import { ogaiCatalog } from "@/lib/data/ogai-catalog";
import { publicCatalog, getModel, providerReady } from "@/lib/providers";
import { VIPEAK_MODELS } from "@/lib/providers/vipeak";

export const metadata: Metadata = {
  title: "Model Catalog — NEXORA AI",
  description:
    "Every model NEXORA can run: uncensored local LLMs (DeepSeek V4.1 Flash, GLM-5.3, Qwen3.8-27B Abliterated, Gemma 4 31B Heretic, Venice Uncensored 1.2), generation models, and the Open Generative AI catalog. Local-first, honest availability.",
};

export default function ModelsPage() {
  const generation = publicCatalog().map((m) => ({
    ...m,
    ready: (() => {
      const entry = getModel(m.id);
      return entry ? providerReady(entry) : false;
    })(),
  }));

  return (
    <>
      <Navbar />
      <ModelsBrowser
        llm={publicLlmCatalog()}
        generation={generation}
        ogai={ogaiCatalog()}
        vipeak={VIPEAK_MODELS}
      />
      <Footer />
    </>
  );
}
