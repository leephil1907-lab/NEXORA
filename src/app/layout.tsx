import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"]
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: "NEXORA — Image & Video Studio",
    template: "%s · NEXORA"
  },
  description:
    "NEXORA is a cloud image and video creation studio for photorealistic imagery and cinematic motion. Real model inference, auditable jobs, private libraries and transparent credit accounting.",
  applicationName: "NEXORA",
  keywords: ["AI image generation", "AI video generation", "image to video", "Wan", "LTX-Video", "FLUX", "photorealistic", "cinematic AI", "generative media"],
  openGraph: {
    title: "NEXORA — Real AI Image & Video Studio",
    description: "Photorealistic images. Cinematic video. Real model inference with auditable jobs and honest status, end to end.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        {/* Tool-interface background: flat charcoal + faint grid */}
        <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-ink" />
          <div className="absolute inset-0 grid-lines opacity-60" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
