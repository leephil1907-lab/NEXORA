import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CasesClient } from "./cases-client";
export const metadata: Metadata = { title: "Creation Cases", description: "Reusable image and video production briefs." };
export default function CasesPage() { return <><Navbar /><CasesClient /><Footer /></>; }
