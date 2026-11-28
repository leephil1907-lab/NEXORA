/**
 * NEXORA tool registry.
 * Each dedicated tool maps to an implemented Gemini image or video workflow.
 * Specialized image tools use focused prompt presets on the same configured engine.
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
    name: "AI Image Generator",
    category: "Images",
    kind: "image",
    workflow: "text-to-image",
    desc: "Turn a written idea into an original image with Gemini image generation.",
    tag: "Text to image",
    badge: "New",
    needsReference: false,
    steps: ["Describe your idea", "Choose the format", "Generate", "Save or animate"],
    promptTemplate: "Create a polished, high-detail image with a clear subject, deliberate composition, natural lighting and refined visual details.",
  },
  {
    slug: "image-editor",
    name: "Image-to-Image Editor",
    category: "Images",
    kind: "image",
    workflow: "image-edit",
    desc: "Upload an image and direct precise visual changes while using it as the reference.",
    tag: "Image to image",
    badge: "Pro",
    needsReference: true,
    steps: ["Upload a reference", "Describe the changes", "Generate", "Compare and save"],
    promptTemplate: "Edit the uploaded image according to these instructions. Preserve the subject identity, important details, composition and visual continuity unless I explicitly ask to change them.",
  },
  {
    slug: "style-transfer",
    name: "Same Style Studio",
    category: "Images",
    kind: "image",
    workflow: "image-edit",
    desc: "Use a reference image to guide the visual direction, mood, palette and overall art style.",
    tag: "Reference guided",
    badge: "Hot",
    needsReference: true,
    steps: ["Upload a style reference", "Describe your subject", "Generate", "Save your variation"],
    promptTemplate: "Use the uploaded image as a visual style reference. Carry over its color palette, lighting, texture, mood and artistic direction while creating this new subject: ",
  },
  {
    slug: "avatar-studio",
    name: "Avatar & Portrait Studio",
    category: "Images",
    kind: "image",
    workflow: "text-to-image",
    desc: "Create profile portraits, character concepts and polished avatar artwork from a description.",
    tag: "Portraits",
    needsReference: false,
    steps: ["Describe the character", "Choose portrait format", "Generate", "Save to your library"],
    promptTemplate: "Create a distinctive, polished avatar portrait. Subject: [describe appearance]. Framing: head and shoulders. Expression: natural and confident. Lighting: soft studio light. Background: clean and intentional. Render with detailed facial features and a refined finish.",
  },
  {
    slug: "product-photography",
    name: "Product Photography",
    category: "Images",
    kind: "image",
    workflow: "text-to-image",
    desc: "Create premium product imagery, clean hero shots and campaign-ready product scenes.",
    tag: "Product visuals",
    badge: "Pro",
    needsReference: false,
    steps: ["Describe the product", "Set the scene", "Generate", "Download or reuse"],
    promptTemplate: "Create premium commercial product photography for: [product]. Use a carefully styled set, controlled studio lighting, realistic materials, crisp product details, intentional reflections and an elegant advertising composition.",
  },
  {
    slug: "fashion-studio",
    name: "Fashion & Design Studio",
    category: "Images",
    kind: "image",
    workflow: "text-to-image",
    desc: "Explore outfit concepts, fashion editorials, fabric direction and styling ideas.",
    tag: "Fashion design",
    needsReference: false,
    steps: ["Describe the look", "Set the editorial mood", "Generate", "Save your concept"],
    promptTemplate: "Create a high-end fashion editorial for: [garment, outfit or concept]. Show the silhouette, materials, construction, styling and details clearly. Use considered editorial lighting and a cohesive art direction.",
  },
  {
    slug: "poster-studio",
    name: "Poster & Thumbnail Maker",
    category: "Images",
    kind: "image",
    workflow: "text-to-image",
    desc: "Design bold visual concepts for posters, thumbnails, covers and promotional artwork.",
    tag: "Graphic concepts",
    needsReference: false,
    steps: ["Describe the message", "Choose the composition", "Generate", "Save or edit"],
    promptTemplate: "Create a striking poster or video-thumbnail concept for: [topic]. Establish a strong focal point, clear visual hierarchy, bold composition, legible space for title text and a professional campaign finish.",
  },
  {
    slug: "text-to-video",
    name: "Text-to-Video Studio",
    category: "Video",
    kind: "video",
    workflow: "text-to-video",
    desc: "Create a cinematic video from a scene description with Gemini Omni and synchronized audio output.",
    tag: "Text to video",
    badge: "New",
    needsReference: false,
    steps: ["Describe the scene", "Set duration and format", "Generate", "Preview and download"],
    promptTemplate: "A cinematic sequence with natural motion, coherent action, atmospheric lighting and a deliberate camera move. Scene: ",
  },
  {
    slug: "image-to-video",
    name: "Image-to-Video Studio",
    category: "Video",
    kind: "video",
    workflow: "image-to-video",
    desc: "Animate an uploaded or saved image with a motion prompt using Gemini Omni.",
    tag: "Image to video",
    badge: "Hot",
    needsReference: true,
    steps: ["Upload or choose a start frame", "Describe the motion", "Generate", "Preview and download"],
    promptTemplate: "Animate the reference image into a natural, cinematic shot. Preserve the subject, styling and scene identity. Motion: ",
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
