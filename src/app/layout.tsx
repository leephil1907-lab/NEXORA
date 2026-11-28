import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "@/components/site/motion";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "NEXORA — Image & Video Studio",
    template: "%s · NEXORA"
  },
  description:
    "NEXORA is a cloud image and video creation studio for photorealistic imagery and cinematic motion. Real model inference, auditable jobs, private libraries and transparent credit accounting.",
  applicationName: "NEXORA",
  keywords: ["AI image generation", "AI video generation", "image to video", "Wan", "LTX-Video", "FLUX", "photorealistic", "cinematic", "generative media"],
  openGraph: {
    title: "NEXORA — Image & Video Studio",
    description: "Photorealistic images. Cinematic video. Real model inference with auditable jobs and transparent credit accounting.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-ink" />
          <div className="absolute inset-0 grid-lines opacity-50" />
        </div>
        <ScrollProgress />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
