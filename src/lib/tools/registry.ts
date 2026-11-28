/**
 * NEXORA tool registry — the reference sites' feature flow, mapped onto the
 * real generation engine. Every tool is a genuine workspace preset: input →
 * configure → generate → result → tasks. No mock content, no templates.
 */

export type ToolCategory = "Images" | "Video";

export type ToolEntry = {
  slug: string;
  name: string;
  category: ToolCategory;
  kind: "image" | "video";
  /** Engine workflow preset: decides reference input, model defaults, settings. */
  workflow: "text-to-image" | "image-edit" | "pose" | "text-to-video" | "image-to-video" | "video-studio" | "video-audio" | "video-extension";
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
    desc: "Turn a few words into a whole new image. Choose a model, aspect ratio and creative direction.",
    tag: "Prompt based",
    badge: "New",
    needsReference: false,
    steps: ["Describe your image", "Pick model & format", "Generate", "Download or refine"],
    preferredModelId: "flux-schnell",
    promptTemplate: "A cinematic editorial portrait, soft directional light, rich natural textures, shot on medium format",
  },
  {
    slug: "image-editor",
    name: "Image Editor",
    category: "Images",
    kind: "image",
    workflow: "image-edit",
    desc: "Edit your image. Reimagine every detail — restyle, relight, recolor or redesign any upload.",
    tag: "Upload based",
    badge: "Pro",
    needsReference: true,
    steps: ["Upload an image", "Describe the edit", "Generate", "Compare & download"],
    preferredModelId: "flux-kontext-dev",
  },
  {
    slug: "pose-generator",
    name: "AI Pose Generator",
    category: "Images",
    kind: "image",
    workflow: "pose",
    desc: "Guide the pose from a reference. Direct composition and body language while the scene follows your prompt.",
    tag: "Reference guided",
    needsReference: true,
    steps: ["Upload a pose reference", "Describe the subject & scene", "Generate", "Download"],
    preferredModelId: "flux-kontext-dev",
    promptTemplate: "Same pose as the reference image, full-body shot, studio lighting, sharp detail",
  },
  {
    slug: "text-to-video",
    name: "Text to Video",
    category: "Video",
    kind: "video",
    workflow: "text-to-video",
    desc: "Create cinematic clips from a written scene description using an available video model.",
    tag: "Prompt based",
    needsReference: false,
    steps: ["Write your scene", "Set duration & format", "Generate", "Preview & extend"],
    preferredModelId: "wan-2.5-t2v",
    promptTemplate: "A cinematic tracking shot, atmospheric lighting, subtle motion, film grain",
  },
  {
    slug: "image-to-video",
    name: "Image to Video",
    category: "Video",
    kind: "video",
    workflow: "image-to-video",
    desc: "Upload a still image, describe the movement and generate an animated video from it.",
    tag: "Image animation",
    badge: "Hot",
    needsReference: true,
    steps: ["Upload a still image", "Describe the motion", "Generate", "Preview & download"],
    preferredModelId: "wan-2.5-i2v",
    promptTemplate: "Natural subtle motion, smooth camera drift, realistic lighting preserved",
  },
  {
    slug: "video-studio",
    name: "Video Studio",
    category: "Video",
    kind: "video",
    workflow: "video-studio",
    desc: "Direct the scene. Make your story move — long-form clips built from your shots, extended in both directions.",
    tag: "Long video",
    badge: "Long video",
    needsReference: true,
    steps: ["Open with an image or prompt", "Direct motion & pacing", "Generate the shot", "Extend to build the story"],
    preferredModelId: "ltx-video-0.9.7-distilled",
    promptTemplate: "Cinematic scene, dynamic camera movement, rich atmosphere, continuous motion",
  },
  {
    slug: "video-audio-studio",
    name: "Video Audio Studio",
    category: "Video",
    kind: "video",
    workflow: "video-audio",
    desc: "Bring images, motion and sound together in one video — synchronized audio generated with the clip.",
    tag: "Native sound",
    badge: "New",
    needsReference: true,
    steps: ["Upload an image or write a scene", "Enable synchronized audio", "Generate", "Preview with sound"],
    preferredModelId: "wan-2.5-i2v",
    promptTemplate: "Cinematic scene with matching ambient sound design and natural motion",
  },
  {
    slug: "video-extension",
    name: "Video Extension",
    category: "Video",
    kind: "video",
    workflow: "video-extension",
    desc: "Keep the story going — continue any finished clip forward in time with matched motion and style.",
    tag: "Continue clips",
    needsReference: true,
    steps: ["Pick a finished clip", "Direct what happens next", "Generate the extension", "Stitch & download"],
    preferredModelId: "ltx-video-0.9.7-distilled",
    promptTemplate: "Continue the motion seamlessly, same style and lighting, forward in time",
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
