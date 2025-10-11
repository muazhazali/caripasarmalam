import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getMarketById } from "@/lib/markets-data"
import MarketDetailClient from "@/components/market-detail-client"

interface MarketPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const market = getMarketById(resolvedParams.id)
  
  if (!market) {
    return {
      title: "Market Not Found",
      description: "The requested market could not be found.",
    }
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"
  const url = `${base}/markets/${market.id}`
  
  // Create location-based keywords for better local SEO
  const locationKeywords = [
    `pasar malam ${market.district}`,
    `pasar malam ${market.state}`,
    `night market ${market.district}`,
    `night market ${market.state}`,
    market.name,
    market.address.split(',')[0], // Street name
  ].filter(Boolean).join(", ")

  // Enhanced description with location and schedule info
  const scheduleText = market.schedule
    .map((s) => `${s.days.join(", ")}: ${s.times.map((t) => `${t.start}-${t.end}`).join(", ")}`)
    .join("; ")
  
  const description = market.description || 
    `Maklumat lengkap pasar malam ${market.name} di ${market.district}, ${market.state}. Waktu operasi: ${scheduleText}. Kemudahan: ${market.parking.available ? 'tempat letak kereta' : ''} ${market.amenities.toilet ? 'tandas' : ''} ${market.amenities.prayer_room ? 'surau' : ''}. Alamat: ${market.address}`

  const title = `${market.name} | Pasar Malam ${market.district}, ${market.state} | Waktu Operasi & Lokasi`

  return {
    title,
    description,
    keywords: [
      "pasar malam",
      `pasar malam ${market.state}`,
      `pasar malam ${market.district}`,
      market.name,
      "night market",
      "night market Malaysia",
      locationKeywords,
    ].join(", "),
    alternates: {
      canonical: url,
      languages: {
        "ms-MY": url,
        "en-MY": `${url}?lang=en`,
      },
    },
    openGraph: {
      type: "article",
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
          alt: `${market.name} - Pasar Malam ${market.district}`,
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
      "market:schedule": scheduleText,
      "market:district": market.district,
      "market:state": market.state,
      "market:area": `${market.area_m2} m²`,
      "market:stalls": market.total_shop?.toString() || "N/A",
    },
  }
}

export default async function MarketPage({ params }: MarketPageProps) {
  const resolvedParams = await params
  const market = getMarketById(resolvedParams.id)

  if (!market) {
    notFound()
  }

  return <MarketDetailClient market={market} />
}
