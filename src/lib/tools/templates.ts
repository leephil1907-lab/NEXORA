/**
 * NEXORA template gallery — real prompt presets (no person-based content,
 * no real-person templates). Every template opens a real tool pre-filled
 * with its prompt via the engine's ?prompt= flow.
 */

export type TemplateCategory =
  | "Cinematic"
  | "Fashion"
  | "Glamour"
  | "Romance"
  | "Fitness"
  | "Fantasy"
  | "Product";

export type TemplatePreset = {
  id: string;
  name: string;
  category: TemplateCategory;
  kind: "image" | "video";
  /** Tool slug this preset opens. */
  tool: string;
  prompt: string;
  badge?: "New" | "Hot" | "Pro";
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Cinematic",
  "Fashion",
  "Glamour",
  "Romance",
  "Fitness",
  "Fantasy",
  "Product",
];

export const TEMPLATES: TemplatePreset[] = [
  {
    id: "neon-rain-alley",
    name: "Neon Rain Alley",
    category: "Cinematic",
    kind: "video",
    tool: "text-to-video",
    prompt:
      "A cinematic tracking shot through a neon-lit rain alley at night, reflections on wet asphalt, anamorphic lens flare, teal and orange grade, subtle film grain, slow dolly-in",
    badge: "Hot",
  },
  {
    id: "golden-hour-desert",
    name: "Golden Hour Desert",
    category: "Cinematic",
    kind: "video",
    tool: "image-to-video",
    prompt:
      "Slow aerial drift over warm desert dunes at golden hour, long shadows, heat haze, cinematic 35mm film look, gentle wind motion in the sand",
  },
  {
    id: "rooftop-skyline",
    name: "Rooftop Skyline",
    category: "Cinematic",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Cinematic rooftop scene above a glittering city skyline at blue hour, dramatic clouds, wide establishing shot, moody atmosphere, shot on ARRI Alexa",
  },
  {
    id: "editorial-color-block",
    name: "Editorial Color Block",
    category: "Fashion",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "High-fashion editorial portrait, bold color-blocking studio backdrop, sharp tailoring details, crisp strobe lighting, magazine cover framing, ultra-detailed fabric texture",
    badge: "New",
  },
  {
    id: "runway-motion",
    name: "Runway Motion",
    category: "Fashion",
    kind: "video",
    tool: "image-to-video",
    prompt:
      "Fashion runway walk in slow motion, dynamic rim lighting, fabric movement, audience bokeh, confident pacing, synchronized ambient sound design",
    badge: "Pro",
  },
  {
    id: "street-style",
    name: "Street Style Snap",
    category: "Fashion",
    kind: "image",
    tool: "image-editor",
    prompt:
      "Restyle this photo into a street-style fashion shot: urban backdrop, natural daylight, candid energy, sharp outfit detail, editorial color grade",
  },
  {
    id: "golden-glamour",
    name: "Golden Glamour",
    category: "Glamour",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Golden hour glamour portrait, warm rim light, elegant styling, soft bokeh cityscape background, refined makeup detail, luxury magazine aesthetic",
  },
  {
    id: "velvet-studio",
    name: "Velvet Studio",
    category: "Glamour",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Studio glamour portrait against deep velvet backdrop, sculpted key light with gentle falloff, jewelry sparkle highlights, timeless Hollywood lighting",
  },
  {
    id: "pier-sunset",
    name: "Pier at Sunset",
    category: "Romance",
    kind: "video",
    tool: "image-to-video",
    prompt:
      "Couple silhouette walking on a sunset pier, warm atmospheric haze, gentle wave motion, soft light bloom, romantic film still brought to life",
  },
  {
    id: "candlelit-dinner",
    name: "Candlelit Dinner",
    category: "Romance",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Romantic candlelit dinner scene for two, warm intimate lighting, elegant table setting, shallow depth of field, cinematic warmth",
  },
  {
    id: "rainy-window",
    name: "Rainy Window Letters",
    category: "Romance",
    kind: "video",
    tool: "text-to-video",
    prompt:
      "Raindrops sliding down a window at dusk, warm room light glowing behind, slow melancholic mood, poetic atmosphere, soft piano-matched pacing",
  },
  {
    id: "gym-hero",
    name: "Gym Hero Shot",
    category: "Fitness",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Dynamic athlete mid-motion, dramatic backlight, chalk dust in the air, high contrast sports campaign look, powerful composition, sharp muscle detail",
    badge: "Hot",
  },
  {
    id: "sprint-slowmo",
    name: "Sprint Slow-Mo",
    category: "Fitness",
    kind: "video",
    tool: "image-to-video",
    prompt:
      "Slow-motion sprint start, dramatic side lighting, dust kick-up, powerful athletic motion, sports commercial energy, crisp motion blur on limbs",
  },
  {
    id: "forest-spirit",
    name: "Forest Spirit",
    category: "Fantasy",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Ethereal forest spirit character, volumetric light shafts through ancient trees, intricate fantasy concept art, glowing particles, painterly detail",
  },
  {
    id: "dragon-ridge",
    name: "Dragon Ridge",
    category: "Fantasy",
    kind: "video",
    tool: "text-to-video",
    prompt:
      "Epic fantasy mountain ridge with a dragon silhouette gliding through storm clouds, lightning flashes, cinematic wide shot, VFX-grade atmosphere",
  },
  {
    id: "luxury-watch",
    name: "Luxury Watch Macro",
    category: "Product",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Luxury watch on obsidian surface, precision studio lighting, controlled reflections, commercial macro photography, ultra-sharp dial detail",
  },
  {
    id: "sneaker-launch",
    name: "Sneaker Launch",
    category: "Product",
    kind: "video",
    tool: "image-to-video",
    prompt:
      "Product launch video for a futuristic sneaker, floating rotation, gradient studio backdrop, punchy light streaks, synchronized beat-driven sound design",
    badge: "New",
  },
  {
    id: "skincare-bloom",
    name: "Skincare Bloom",
    category: "Product",
    kind: "image",
    tool: "text-to-image",
    prompt:
      "Fresh skincare product surrounded by water splashes and flower petals, clean bright studio lighting, commercial freshness aesthetic, crisp droplets",
  },
];

export function getTemplate(id: string): TemplatePreset | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

export function templatesByCategory(): { category: TemplateCategory; templates: TemplatePreset[] }[] {
  return TEMPLATE_CATEGORIES.map((category) => ({
    category,
    templates: TEMPLATES.filter((template) => template.category === category),
  }));
}
