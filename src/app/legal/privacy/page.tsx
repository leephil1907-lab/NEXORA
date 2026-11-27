import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/site/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How NEXORA collects, uses and protects your data."
};

const sections: LegalSection[] = [
  {
    heading: "1. What we collect",
    paragraphs: [
      "Account data: your email address and a display name derived at signup. Age assurance data: the timestamp and method used to record your 18+ confirmation. When you enter a date of birth, NEXORA checks it transiently on the server and does not store the date itself. The current flow is a self-declaration, not an identity-document or biometric check. Generation data: prompts, optional reference images, chosen settings, job status and errors. Media: the outputs generated for you. Credit data: account balances and ledger entries."
    ]
  },
  {
    heading: "2. How it is used",
    paragraphs: [
      "Your data is used to operate the studio: authenticate you, enforce the 18+ access requirement, submit generation jobs to providers, persist your media, track credits, and provide support. We do not sell your personal data, and we do not use your prompts or media to train models."
    ]
  },
  {
    heading: "3. Storage and security",
    paragraphs: [
      "Generated media is stored in private object storage scoped to your account and served only through signed, expiring URLs. Database access is protected by row-level security so accounts cannot read each other's data. Provider credentials and service keys remain server-side and are never delivered to the browser."
    ]
  },
  {
    heading: "4. Third parties",
    paragraphs: [
      "To run the service we rely on: Supabase (authentication, database, storage), the configured generative model providers (inference), and Stripe (payments). Each processes only what is necessary to deliver its part of the service under its own privacy terms."
    ]
  },
  {
    heading: "5. Retention",
    paragraphs: [
      "Jobs, credits and media remain on your account until you delete them or your account is removed. Ledger entries are retained as needed for accounting integrity. Backup copies follow the retention schedules of our infrastructure providers."
    ]
  },
  {
    heading: "6. Your rights",
    paragraphs: [
      "Depending on your jurisdiction, you may have rights to access, correct, export, or delete your personal data, and to object to certain processing. You can exercise these by contacting support from your account email. You may also delete unsubmitted reference uploads directly from the studio."
    ]
  },
  {
    heading: "7. Changes",
    paragraphs: [
      "We will update this policy as the product changes, with a revised date at the top of this page. Material changes will be surfaced in the product where appropriate."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="November 27, 2026"
      intro="Your creations are yours. This policy explains exactly what data NEXORA needs to run, where it lives, and what control you have over it."
      sections={sections}
    />
  );
}
