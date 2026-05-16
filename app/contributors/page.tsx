import { Metadata } from "next";
import ContributorsClient from "@/components/contributors-client";
import { useTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contributors | Cari Pasar Malam Malaysia",
};

export default function ContributorsPage() {
  const t = useTranslation("ms");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t.contributorsTitle}</h1>
      <p className="mt-1 text-muted-foreground">{t.contributorsSubtitle}</p>
      <div className="mt-6">
        <ContributorsClient />
      </div>
    </div>
  );
}
