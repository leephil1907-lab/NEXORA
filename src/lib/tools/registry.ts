/**
 * NEXORA tool registry.
 * Every listed tool maps to a configured provider adapter and a supported model capability.
 */
export type ToolCategory = "Images" | "Video";

export type ToolEntry = {
  slug: string;
  name: string;
  category: ToolCategory;
  kind: "image" | "video";
  workflow: "text-to-image" | "image-edit" | "text-to-video" | "image-to-video" | "video-extension";
  desc: string;
  tag: string;
  badge?: "New" | "Pro" | "Hot" | "Long video";
  needsReference: boolean;
  promptTemplate?: string;
  steps: [string, string, string, string];
  preferredModelId?: string;
};

export const TOOLS: ToolEntry[] = [
  {
    slug: "text-to-image",
    name: "Text to Image",
    category: "Images",
    kind: "image",
    workflow: "text-to-image",
    desc: "Create a new image from a written prompt using the connected Gemini image engine.",
    tag: "Prompt to image",
    badge: "New",
    needsReference: false,
    steps: ["Describe the image", "Choose the aspect ratio", "Generate", "Save or animate"],
    promptTemplate: "A cinematic editorial image, soft directional light, rich natural textures, precise composition",
  },
  {
    slug: "image-editor",
    name: "Image Editor",
    category: "Images",
    kind: "image",
    workflow: "image-edit",
    desc: "Upload an image and describe the changes you want. Uses Gemini reference-image editing.",
    tag: "Reference image",
    badge: "Pro",
    needsReference: true,
    steps: ["Upload an image", "Describe the edit", "Generate", "Compare and save"],
  },
  {
    slug: "text-to-video",
    name: "Text to Video",
    category: "Video",
    kind: "video",
    workflow: "text-to-video",
    desc: "Create a video clip from a scene description with supported duration and resolution settings.",
    tag: "Prompt to video",
    needsReference: false,
    steps: ["Describe the scene", "Choose duration and format", "Generate", "Preview and download"],
    promptTemplate: "A cinematic tracking shot, atmospheric lighting, natural movement, rich film detail",
  },
  {
    slug: "image-to-video",
    name: "Image to Video",
    category: "Video",
    kind: "video",
    workflow: "image-to-video",
    desc: "Animate an uploaded or previously generated image with a motion prompt.",
    tag: "Animate an image",
    badge: "Hot",
    needsReference: true,
    steps: ["Upload or choose an image", "Describe the motion", "Generate", "Preview and download"],
    promptTemplate: "Natural subtle motion, smooth camera drift, realistic lighting preserved",
  },

];

export function getTool(slug: string): ToolEntry | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function toolsByCategory(): { category: ToolCategory; tools: ToolEntry[] }[] {
  return [
    { category: "Images", tools: TOOLS.filter((tool) => tool.category === "Images") },
    { category: "Video", tools: TOOLS.filter((tool) => tool.category === "Video") },
  ];
}
