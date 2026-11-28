import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ChatClient } from "./chat-client";

export const metadata: Metadata = {
  title: "Uncensored Chat — NEXORA AI",
  description:
    "Chat with uncensored models (DeepSeek V4.1 Flash, GLM-5.3, Qwen3.8-27B Abliterated, Gemma 4 31B Heretic, Venice Uncensored 1.2). Local-first: your machine runs the models, hosted engines are optional fallbacks.",
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
