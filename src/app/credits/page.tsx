import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CreditsPage } from "@/components/site/credits-page";

export const metadata: Metadata = {
  title: "Credits",
  description:
    "How NEXORA credits work: real credit accounting for real model runs, automatic refunds on failure, and full ledger visibility."
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <CreditsPage />
      </main>
      <Footer />
    </>
  );
}
