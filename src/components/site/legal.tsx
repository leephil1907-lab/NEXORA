import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export type LegalSection = { heading: string; paragraphs: string[] };

export function LegalPage({
  title,
  updated,
  intro,
  sections
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-8">
        <div className="site-container max-w-[820px]">
          <span className="eyebrow">
            <span className="eyebrow-line" /> Legal
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-dim">Last updated {updated}</p>
          <p className="mt-8 text-base leading-relaxed text-muted">{intro}</p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl font-semibold text-white/95">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-4 text-sm leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="glass-strong mt-16 rounded-2xl p-6">
            <p className="text-sm text-muted">
              Questions about this document? Reach the team through your account email thread,
              or review the{" "}
              <Link href="/#faq" className="text-lime underline-offset-4 hover:underline">
                product FAQ
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
