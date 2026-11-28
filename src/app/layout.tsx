import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
          <div className="absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-emerald-300/[.075] blur-[110px]" />
          <div className="absolute -right-40 top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-sky-300/[.09] blur-[125px]" />
          <div className="absolute bottom-[-18rem] left-[35%] h-[32rem] w-[32rem] rounded-full bg-indigo-400/[.07] blur-[130px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
