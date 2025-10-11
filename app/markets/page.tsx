import type { Metadata } from "next"
import { getAllMarkets } from "@/lib/markets-data"
import MarketsFilterClient from "@/components/markets-filter-client"

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"
  const url = `${base}/markets`
  
  const title = "Direktori Pasar Malam Malaysia | Senarai Pasar Malam Mengikut Negeri"
  const description = "Lihat senarai pasar malam seluruh Malaysia mengikut negeri dan hari: KL, Selangor, Johor, Pulau Pinang, Negeri Sembilan dan lain-lain. Cari pasar malam terdekat dengan kemudahan dan waktu operasi."
  
  const keywords = [
    "pasar malam",
    "direktori pasar malam",
    "pasar malam negeri",
    "pasar malam KL",
    "pasar malam Kuala Lumpur",
    "pasar malam Selangor",
    "pasar malam Johor",
    "pasar malam Pulau Pinang",
    "pasar malam Negeri Sembilan",
    "night market Malaysia",
    "night market directory",
    "pasar malam Malaysia",
  ].join(", ")

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        "ms-MY": url,
        "en-MY": `${url}?lang=en`,
      },
    },
    openGraph: {
      type: "website",
      locale: "ms_MY",
      url,
      siteName: "Cari Pasar Malam Malaysia",
      title,
      description,
      images: [
        {
          url: "/placeholder.jpg",
          width: 1200,
          height: 630,
          alt: "Direktori Pasar Malam Malaysia",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/placeholder.jpg"],
    },
    other: {
      "page:type": "directory",
      "page:markets_count": getAllMarkets().length.toString(),
    },
  }
}

export default function MarketsPage() {
  const markets = getAllMarkets()
  
  return <MarketsFilterClient markets={markets} />
}
