import { getMarketById } from "@/lib/markets-data"

type Props = {
  params: Promise<{ id: string }>
}

export default async function Head({ params }: Props) {
  const resolved = await params
  const market = getMarketById(resolved.id)
  if (!market) return null

  const title = `${market.name} | Pasar Malam ${market.district}, ${market.state}`
  const description = market.description || `Maklumat pasar malam ${market.name} di ${market.district}, ${market.state}. Waktu operasi, kemudahan, alamat dan lokasi peta.`
  const keywords = [
    "pasar malam",
    `pasar malam ${market.state}`,
    `pasar malam ${market.district}`,
    market.name,
    "night market",
  ].join(", ")
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"
  const url = `${base}/markets/${market.id}`
  const image = "/placeholder.jpg"

  const scheduleText = market.schedule
    .map((s) => `${s.days.join(", ")}: ${s.times.map((t) => `${t.start}-${t.end}`).join(", ")}`)
    .join("; ")

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:type" content="article" />
      <meta property="og:locale" content="ms_MY" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            name: market.name,
            description,
            address: market.address,
            url,
            hasMap: market.location?.gmaps_link,
            geo: market.location
              ? { "@type": "GeoCoordinates", latitude: market.location.latitude, longitude: market.location.longitude }
              : undefined,
            containedInPlace: { "@type": "AdministrativeArea", name: market.state },
            openingHoursSpecification: market.schedule.map((s) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: s.days,
              opens: s.times[0]?.start,
              closes: s.times[s.times.length - 1]?.end,
            })),
          }),
        }}
      />
      <meta name="market:schedule" content={scheduleText} />
    </>
  )
}


