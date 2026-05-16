"use client";

import { useLanguage } from "@/components/language-provider";
import ContributorsClient from "@/components/contributors-client";

export default function AboutClient() {
  const { t } = useLanguage();
  const contributorsNote =
    t.contributorsTitle === "Contributors"
      ? "This section is for those who contribute to the project."
      : "Bahagian ini adalah untuk mereka yang menyumbang kepada projek ini.";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t.aboutTitle}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>{t.aboutPara1}</p>
        <p>{t.aboutPara2}</p>
        <p>{t.aboutPara3}</p>
        <p>{t.aboutPara4}</p>
        <p>{t.aboutPara5}</p>
        <p>{t.aboutPara6}</p>
        <p>{t.aboutPara7}</p>
      </div>

      <section className="mt-12 border-t border-border pt-10">
        <h2 className="text-xl font-semibold tracking-tight">{t.contributorsTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{contributorsNote}</p>
        <div className="mt-6">
          <ContributorsClient />
        </div>
      </section>
    </div>
  );
}
