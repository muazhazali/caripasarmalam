import type { Metadata } from "next"
import { cookies } from "next/headers"
import { useTranslation } from "@/lib/i18n"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExternalLink, Github, Linkedin } from "lucide-react"

interface Contributor {
  name: string
  role?: string
  link?: string
}

function getLinkInfo(url: string) {
  if (url.includes('linkedin.com')) {
    return { text: 'LinkedIn', icon: Linkedin }
  } else if (url.includes('github.com')) {
    return { text: 'GitHub', icon: Github }
  } else {
    return { text: 'External Link', icon: ExternalLink }
  }
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
    { name: "Kamalin Annuar", role: "Data Collector, Cleaner", link: "https://www.linkedin.com/in/kamalin-annuar/" },
    { name: "Nayli Umairah", role: "UI/UX Designer", link: "https://www.linkedin.com/in/nayli-u-24b90a272/" },
    { name: "Safinah Rashid", role: "Manual Tester", link: "https://www.linkedin.com/in/safinah-rashid/" },
    { name: "Ainur Farihah", role: "Data Contributor", link: "https://www.linkedin.com/in/ainur-farihah-957a9a266/" },
    { name: "Meor Muhammad Hakimi", role: "Data Contributor", link: "https://www.linkedin.com/in/meor-hakimi-314b9024b/" },
    { name: "Afifah", role: "Data Contributor", link: "https://www.linkedin.com/in/nurul-afifah-818a85169/" },
    { name: "GitHub Contributors", role: "Developer & Maintainer", link: "https://github.com/muazhazali/caripasarmalam/graphs/contributors" },
    { name: "nawicon", role: "Icon Designer", link: "https://www.flaticon.com/free-icon/shop_5193727?term=location&related_id=5193727" }
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
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {(() => {
                      const linkInfo = getLinkInfo(c.link)
                      const IconComponent = linkInfo.icon
                      return (
                        <>
                          <IconComponent className="h-4 w-4" />
                          {linkInfo.text}
                        </>
                      )
                    })()}
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


