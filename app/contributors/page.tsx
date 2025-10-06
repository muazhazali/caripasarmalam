import type { Metadata } from "next"
import { cookies } from "next/headers"
import { useTranslation } from "@/lib/i18n"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Contributor {
  name: string
  role?: string
  link?: string
}

export const metadata: Metadata = {
  title: "Contributors | Cari Pasar Malam Malaysia",
}

export default async function ContributorsPage() {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get("language")?.value
  const lang = cookieLang === "en" ? "en" : "ms"
  const t = useTranslation(lang)
  const contributors: Contributor[] = [
    { name: "John", role: "Contributor", link: "https://example.com/john" },
    { name: "Jane", role: "Contributor", link: "https://example.com/jane" },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t.contributorsTitle}</h1>
      <p className="text-muted-foreground mt-1">{t.contributorsSubtitle}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contributors.map((c) => (
          <Card key={c.name} className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{c.name}</CardTitle>
              {c.role ? (
                <CardDescription>{c.role}</CardDescription>
              ) : null}
              {c.link ? (
                <CardDescription>
                  <Link
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {c.link}
                  </Link>
                </CardDescription>
              ) : null}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}


