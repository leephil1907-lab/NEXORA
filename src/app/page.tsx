import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { HomeHub } from "@/components/site/home-hub";

export const metadata: Metadata = {
  title: "NEXORA — Creative Image & Video Studio",
  description:
    "A focused creative studio for image generation, image editing, portraits, product photography, fashion concepts, text-to-video and image-to-video.",
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
