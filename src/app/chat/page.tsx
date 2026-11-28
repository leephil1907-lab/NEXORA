import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ChatClient } from "./chat-client";

export const metadata: Metadata = {
  title: "AI Chat — NEXORA",
  description: "A creative assistant powered by NEXORA's connected hosted inference provider.",
};

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const { prompt = "" } = await searchParams;
  return (
    <>
      <Navbar />
      <ChatClient initialPrompt={prompt.slice(0, 4000)} />
      <Footer />
    </>
  );
}
