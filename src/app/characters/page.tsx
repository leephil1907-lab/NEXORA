import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CharactersClient } from "./characters-client";
export const metadata: Metadata = { title: "Characters", description: "Create and manage persistent fictional characters for consistent creative sessions." };
export default function CharactersPage() { return <><Navbar /><CharactersClient /><Footer /></>; }
