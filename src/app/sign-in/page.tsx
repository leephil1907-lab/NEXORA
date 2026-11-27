import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/site/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your NEXORA creative studio with a secure email link."
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignInForm />
    </Suspense>
  );
}
