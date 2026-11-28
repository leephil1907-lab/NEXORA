import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { HomeHub } from "@/components/site/home-hub";

export const metadata: Metadata = {
  title: "NEXORA AI — NSFW AI Image & Video Studio (18+)",
  description:
    "Advanced AI image and video generation for consenting adults: text to image, image editor, pose generator, text to video, image to video, video studio with native sound. Real engines, no placeholders.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomeHub />
      <Footer />
    </>
  );
}
