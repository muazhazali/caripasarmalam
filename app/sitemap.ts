import type { MetadataRoute } from "next"
import { getAllMarkets } from "@/lib/markets-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"
  const markets = getAllMarkets()
  const now = new Date().toISOString()

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/markets`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contributors`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const marketRoutes: MetadataRoute.Sitemap = markets.map((m) => ({
    url: `${base}/markets/${m.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...routes, ...marketRoutes]
}


