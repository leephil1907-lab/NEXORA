/**
 * NEXORA uncensored chat-model catalog — LOCAL-FIRST.
 *
 * Every entry maps to a real, publicly documented model build (Hugging Face
 * repos verified where a canonical community build exists). Primary runtime is
 * the user's own machine: either a direct OpenAI-compatible endpoint
 * (NEXORA_LLM_ENDPOINT / llama.cpp / LM Studio / Ollama / Uncensored Local AI)
 * or the NEXORA Local Companion queue. Hosted backends (Omega AI, Venice) are
 * optional fallbacks and are honestly marked as such.
 *
 * Nothing here fabricates a download: entries without a verified public repo
 * say so and carry a `bind` note telling the operator to bind their own GGUF.
 */

export type LlmRuntime = "local" | "hosted";
export type HostedVia = "omega" | "venice";

export type LlmEntry = {
  id: string;
  /** The label the operator uses for this model. */
  label: string;
  family: string;
  sizeNote: string;
  runtime: LlmRuntime;
  /** Hugging Face repo for the uncensored build, when a canonical one is verified. */
  hfRepo?: string;
  hfRepoVerified: boolean;
  /** Suggested Ollama library tag or llama.cpp file hint. */
  pullHint?: string;
  vramNote?: string;
  /** Model name sent to an OpenAI-compatible local runtime. Bind to whatever you serve. */
  localModelId: string;
  hostedVia?: HostedVia;
  /** Hosted provider model id — only meaningful once that provider is configured. */
  hostedModelId?: string;
  note?: string;
};

export const UNCENSORED_LLM_CATALOG: LlmEntry[] = [
  {
    id: "deepseek-v4.1-flash-1017-uncensored",
    label: "DeepSeek V4.1 Flash 1017 Uncensored",
    family: "DeepSeek V4.1 Flash",
    sizeNote: "Flash-class MoE",
    runtime: "local",
    hfRepo: "huihui-ai/Huihui-DeepSeek-V4-Flash-abliterated-GGUF",
    hfRepoVerified: true,
    pullHint: "Huihui DeepSeek-V4-Flash abliterated GGUF (Q4_K_M)",
    vramNote: "Flash-class — fits 12–16 GB",
    localModelId: "deepseek-v4.1-flash-uncensored",
    hostedVia: "omega",
    note: "Abliterated DeepSeek V4.1 Flash build (Huihui mirror line). Serve the GGUF with llama.cpp and bind the served name in Local models.",
  },
  {
    id: "glm-5.3-uncensored",
    label: "GLM-5.3 Uncensored",
    family: "GLM-5.3",
    sizeNote: "Full-size GLM",
    runtime: "local",
    hfRepoVerified: false,
    pullHint: "Bind your GLM-5.3 heretic/abliterated GGUF",
    vramNote: "GLM 5.x heretic tier — 48 GB+ class for full builds",
    localModelId: "glm-5.3-uncensored",
    note: "No single canonical public repo — the GLM 5.x heretic line (see locallyuncensored.com abliterated guide) ships via multiple publishers. Bind your GGUF to this slot.",
  },
  {
    id: "inkling-2-mini-uncensored",
    label: "Inkling 2 Mini Uncensored",
    family: "Inkling 2 Mini",
    sizeNote: "Small multimodal",
    runtime: "local",
    hfRepo: "AtomicChat/Inkling-2-Mini-Uncensored-GGUF",
    hfRepoVerified: true,
    pullHint: "Inkling-2-Mini-Uncensored-AD-Q4_K.gguf + mmproj F16",
    vramNote: "Small — fits 8 GB",
    localModelId: "inkling-2-mini-uncensored",
    note: "Vision-capable mini model. llama-server deploy: -m Inkling-2-Mini-Uncensored-AD-Q4_K.gguf --mmproj mmproj-Inkling-2-Mini-Uncensored-F16.gguf --jinja -c 32768 -ngl 99",
  },
  {
    id: "qwen3.8-27b-abliterated",
    label: "Qwen3.8-27B Abliterated",
    family: "Qwen3.8 27B",
    sizeNote: "27B dense",
    runtime: "local",
    hfRepo: "huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF",
    hfRepoVerified: true,
    pullHint: "Huihui-Qwen3.8-27B-abliterated-GGUF (Q4_K_M ≈ 17 GB)",
    vramNote: "24 GB card comfortable; 16 GB via IQ4_XS",
    localModelId: "qwen3.8-27b-abliterated",
    hostedVia: "omega",
    note: "The most-downloaded abliterated build on Hugging Face (3.5M+ downloads, 1.7k likes as of Nov 2026). Alternative builds: OBLITERATUS/Qwen3.8-27B-OBLITERATED, junafinity/Qwen-3.8-27B-Uncensored.",
  },
  {
    id: "qwen3.8-flash-next-abliterated",
    label: "Qwen3.8-Flash-Next Abliterated",
    family: "Qwen3.8 Flash",
    sizeNote: "Flash-class",
    runtime: "local",
    hfRepoVerified: false,
    pullHint: "Bind your Qwen3.8-Flash abliterated GGUF",
    vramNote: "Flash-class — fits 12–16 GB",
    localModelId: "qwen3.8-flash-next-abliterated",
    note: "Community abliteration of the Qwen3.8 Flash line. Bind your GGUF build to this slot.",
  },
  {
    id: "glm-5.3-flash-uncensored",
    label: "GLM-5.3 Flash Uncensored",
    family: "GLM-5.3 Flash",
    sizeNote: "Flash-class",
    runtime: "local",
    hfRepoVerified: false,
    pullHint: "Bind your GLM-5.3-Flash uncensored GGUF",
    vramNote: "Flash-class — fits 12–16 GB",
    localModelId: "glm-5.3-flash-uncensored",
    note: "Bind your GLM-5.3 Flash heretic/abliterated build.",
  },
  {
    id: "hy4-flash-uncensored",
    label: "Hy4 Flash Uncensored",
    family: "Hy4 Flash",
    sizeNote: "Flash-class",
    runtime: "local",
    hfRepoVerified: false,
    pullHint: "Bind your Hy4-Flash uncensored GGUF",
    vramNote: "Flash-class — fits 12–16 GB",
    localModelId: "hy4-flash-uncensored",
    note: "Bind your Hy4 Flash uncensored build.",
  },
  {
    id: "deepseek-v4-pro-qwen3.5-9b-heretic",
    label: "DeepSeek V4 Pro · Qwen3.5 9B Heretic",
    family: "DeepSeek V4 Pro / Qwen3.5 9B",
    sizeNote: "9B heretic tier",
    runtime: "local",
    hfRepoVerified: false,
    pullHint: "Qwen3.5-9B Heretic line (e.g. The-Defiant-Fable-Uncensored-Heretic builds)",
    vramNote: "9B — fits 8–12 GB",
    localModelId: "qwen3.5-9b-heretic",
    note: "Listed as one line in the operator catalog. Qwen3.5 9B heretic builds are public on Hugging Face (Featherless/abliterated lists); DeepSeek V4 Pro builds vary by publisher — bind yours.",
  },
  {
    id: "gemma-4-31b-heretic",
    label: "Gemma 4 31B Heretic",
    family: "Gemma 4 31B",
    sizeNote: "31B dense, native vision",
    runtime: "local",
    hfRepo: "coder3101/gemma-4-31B-it-heretic",
    hfRepoVerified: true,
    pullHint: "GGUF: llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF (Q4_K_M ≈ 18.8 GB)",
    vramNote: "24 GB card at Q4; 16 GB tight",
    localModelId: "gemma-4-31b-heretic",
    hostedVia: "omega",
    note: "Top local pick of the 2026 abliterated guides — ranks 6th of 1,329 on the UGI leaderboard, 10/10 willingness with thought prefill. Mirrors: Stabhappy/gemma-4-31B-it-heretic-Gguf, llmfan46 GGUF.",
  },
  {
    id: "venice-uncensored-1.2",
    label: "Venice Uncensored 1.2",
    family: "Venice",
    sizeNote: "Hosted",
    runtime: "hosted",
    hfRepoVerified: false,
    localModelId: "venice-uncensored",
    hostedVia: "venice",
    hostedModelId: "venice-uncensored-1.2",
    note: "Hosted on Venice.ai (privacy-forward inference). Runs only when a Venice API key is configured; otherwise bind any local build to this slot.",
  },
];

export function getLlm(id: string): LlmEntry | undefined {
  return UNCENSORED_LLM_CATALOG.find((m) => m.id === id);
}

/** Compact shape for the client (no heavy fields). */
export function publicLlmCatalog() {
  return UNCENSORED_LLM_CATALOG.map((m) => ({
    id: m.id,
    label: m.label,
    family: m.family,
    sizeNote: m.sizeNote,
    runtime: m.runtime,
    hfRepo: m.hfRepo,
    hfRepoVerified: m.hfRepoVerified,
    pullHint: m.pullHint,
    vramNote: m.vramNote,
    hostedVia: m.hostedVia,
    note: m.note,
  }));
}
