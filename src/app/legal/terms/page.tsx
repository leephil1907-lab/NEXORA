import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/site/legal";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that govern your use of the NEXORA creation studio."
};

const sections: LegalSection[] = [
  {
    heading: "1. The service",
    paragraphs: [
      "NEXORA (\"NEXORA\") is a creation studio that submits generation jobs to configured third-party generative model providers and stores the resulting media on your behalf. NEXORA is provided as a self-serve product for creating images and video from text prompts and optional reference images.",
      "NEXORA only executes real provider inference. The product does not fabricate generations, progress, or sample outputs. If a provider is not configured or unavailable, the service returns an explicit error instead of a simulated result."
    ]
  },
  {
    heading: "2. Your account",
    paragraphs: [
      "Access requires an account secured by passwordless email sign-in. You are responsible for keeping access to your email account and for all activity that occurs under your NEXORA account.",
      "You must be old enough to form a binding agreement in your jurisdiction to use NEXORA. Accounts are personal and may not be shared or resold."
    ]
  },
  {
    heading: "3. Credits and payments",
    paragraphs: [
      "Generation consumes credits: one credit per still image and ten credits per video, reserved before the job is submitted to the provider. If a generation fails, the reserved credits are refunded automatically to your account.",
      "Credit packs are one-time purchases processed by Stripe. Credits do not expire. Prices and pack contents are displayed before checkout and confirmed by Stripe at payment time."
    ]
  },
  {
    heading: "4. Your content",
    paragraphs: [
      "You retain rights to the prompts, reference images and media you create with NEXORA, subject to the terms of the underlying model providers and applicable law. You grant NEXORA the limited license needed to process, store and deliver your media to you.",
      "You are responsible for the content you submit. Do not create unlawful, harassing, defamatory, or infringing content, or content that depicts real individuals in a non-consensual sexual, violent, or deceptive way."
    ]
  },
  {
    heading: "5. Acceptable use",
    paragraphs: [
      "You may not use NEXORA to violate law or third-party rights, to attempt to reverse engineer or overload the service or its providers, to resell access, or to circumvent credit accounting, storage controls, or role enforcement.",
      "We may suspend accounts that abuse the service, the providers, or other users. Serious or repeated violations may result in permanent termination."
    ]
  },
  {
    heading: "6. Availability and warranties",
    paragraphs: [
      "NEXORA depends on third-party model providers and cloud infrastructure. The service is provided on an \"as is\" and \"as available\" basis. We do not warrant uninterrupted operation or any particular output from a generative model.",
      "To the maximum extent permitted by law, NEXORA is not liable for indirect, incidental, or consequential damages arising from use of the service. Our total liability is limited to the amount you paid to NEXORA in the twelve months before the claim."
    ]
  },
  {
    heading: "7. Changes",
    paragraphs: [
      "We may update these terms as the product evolves. Material changes will be reflected on this page with an updated date. Continued use after changes take effect constitutes acceptance of the revised terms."
    ]
  }
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="November 27, 2026"
      intro="These terms govern your use of NEXORA. They are written to be read — plain language, no traps. By using the studio you agree to everything below."
      sections={sections}
    />
  );
}
