import type { MetadataRoute } from "next"
import { getMarkets } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"
  const markets = await getMarkets({ status: "Active" })
  const now = new Date().toISOString()

  const routes: MetadataRoute.Sitemap = [
    { 
      url: `${base}/`, 
      lastModified: now, 
      changeFrequency: "weekly", 
      priority: 1,
      alternates: {
        languages: {
          "ms-MY": `${base}/`,
          "en-MY": `${base}/?lang=en`,
        }
      }
    },
    { 
      url: `${base}/markets`, 
      lastModified: now, 
      changeFrequency: "weekly", 
      priority: 0.9,
      alternates: {
        languages: {
          "ms-MY": `${base}/markets`,
          "en-MY": `${base}/markets?lang=en`,
        }
      }
    },
    { 
      url: `${base}/about`, 
      lastModified: now, 
      changeFrequency: "monthly", 
      priority: 0.5,
      alternates: {
        languages: {
          "ms-MY": `${base}/about`,
          "en-MY": `${base}/about?lang=en`,
        }
      }
    },
    { 
      url: `${base}/contributors`, 
      lastModified: now, 
      changeFrequency: "monthly", 
      priority: 0.4,
      alternates: {
        languages: {
          "ms-MY": `${base}/contributors`,
          "en-MY": `${base}/contributors?lang=en`,
        }
      }
    },
  ]

  const marketRoutes: MetadataRoute.Sitemap = markets.map((m) => ({
    url: `${base}/markets/${m.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        "ms-MY": `${base}/markets/${m.id}`,
        "en-MY": `${base}/markets/${m.id}?lang=en`,
      }
    }
  }))

  return [...routes, ...marketRoutes]
}


