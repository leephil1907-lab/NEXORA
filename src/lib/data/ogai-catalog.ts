/**
 * Open Generative AI model catalog (open-models dump).
 *
 * Source: https://github.com/leephil1907-lab/Open-Generative-AI (MIT) —
 * `models_dump.json`, the real input schemas of the studio's text-to-image
 * model line. NEXORA exposes it as a browsable catalog: every entry is a real
 * model with a real request schema. Entries run when a compatible backend is
 * connected (MuAPI tier, or an equivalent self-hosted endpoint); until then
 * they are honestly marked "Catalog — not connected". No simulated output.
 */

import raw from "./ogai-catalog.json";

export type OgaiInput = {
  name: string;
  title?: string;
  type?: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  examples?: unknown[];
};

export type OgaiModel = {
  id: string;
  name: string;
  inputs: Record<string, OgaiInput>;
};

type Dump = { t2i?: OgaiModel[] };

const dump = raw as unknown as Dump;

export type CatalogBrowserEntry = {
  id: string;
  name: string;
  category: "Text to Image";
  summary: string;
  parameters: string[];
  enums: Record<string, string[]>;
};

function summarize(model: OgaiModel): string {
  const promptDesc = model.inputs?.prompt?.description;
  return (promptDesc || `Text-to-image model ${model.name}.`).slice(0, 180);
}

export function ogaiCatalog(): CatalogBrowserEntry[] {
  return (dump.t2i ?? []).map((m) => {
    const parameters: string[] = [];
    const enums: Record<string, string[]> = {};
    for (const [key, input] of Object.entries(m.inputs ?? {})) {
      parameters.push(input.title ? `${key} (${input.title})` : key);
      if (input.enum && input.enum.length > 0) enums[key] = input.enum;
    }
    return {
      id: m.id,
      name: m.name,
      category: "Text to Image",
      summary: summarize(m),
      parameters,
      enums,
    };
  });
}

export function ogaiCount(): number {
  return (dump.t2i ?? []).length;
}
