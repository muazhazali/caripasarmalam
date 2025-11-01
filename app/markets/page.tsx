import type { Metadata } from "next"
import { getMarkets } from "@/lib/db"
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

  // Get markets count for metadata
  const markets = await getMarkets({ status: "Active", limit: 1 })

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
    },
  }
}

interface MarketsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function MarketsPage({ searchParams }: MarketsPageProps) {
  // Extract filters from URL searchParams
  const state = searchParams?.state as string | undefined
  const day = searchParams?.day as string | undefined

  // Map localized day names to day codes
  const dayMap: Record<string, string> = {
    "Isnin": "mon",
    "Selasa": "tue",
    "Rabu": "wed",
    "Khamis": "thu",
    "Jumaat": "fri",
    "Sabtu": "sat",
    "Ahad": "sun",
  }
  
  const dayCode = day && dayMap[day] ? (dayMap[day] as any) : undefined

  // Fetch markets with server-side filters
  const filters = {
    state: state && state !== "All States" && state !== "Semua Negeri" ? state : undefined,
    day: dayCode,
    status: "Active" as const,
    limit: 500, // Higher limit for markets page
  }

  const markets = await getMarkets(filters)
  
  return <MarketsFilterClient initialMarkets={markets} initialState={state} />
}
