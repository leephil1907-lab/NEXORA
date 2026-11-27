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
        {/* Ambient background: aurora blobs + grid + film grain */}
        <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-ink" />
          <div className="absolute inset-0 grid-lines" />
          <div className="absolute -top-[30vh] left-1/2 h-[80vh] w-[80vw] max-w-[1100px] -translate-x-1/2 rounded-full opacity-60 blur-[120px] animate-aurora-a"
            style={{ background: "radial-gradient(ellipse at center, rgba(124,92,255,.32), transparent 65%)" }} />
          <div className="absolute top-[45vh] -left-[20vw] h-[60vh] w-[55vw] rounded-full opacity-40 blur-[130px] animate-aurora-b"
            style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,.22), transparent 65%)" }} />
          <div className="absolute bottom-[-20vh] right-[-10vw] h-[55vh] w-[50vw] rounded-full opacity-35 blur-[130px] animate-aurora-b"
            style={{ background: "radial-gradient(ellipse at center, rgba(232,121,249,.2), transparent 65%)" }} />
        </div>
        <div aria-hidden className="grain" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
