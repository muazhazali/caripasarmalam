export default function Head() {
  const title = "Direktori Pasar Malam Malaysia | Senarai Pasar Malam Mengikut Negeri"
  const description =
    "Lihat senarai pasar malam seluruh Malaysia mengikut negeri dan hari: KL, Selangor, Johor, Pulau Pinang, Negeri Sembilan dan lain-lain."
  const keywords = [
    "pasar malam",
    "direktori pasar malam",
    "pasar malam negeri",
    "pasar malam KL",
    "pasar malam Kuala Lumpur",
    "pasar malam Selangor",
    "pasar malam Johor",
  ].join(", ")
  const url = (process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app") + "/markets"
  const image = "/placeholder.jpg"
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Cari Pasar Malam" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ms_MY" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Cari Pasar Malam Malaysia" />
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
            "@type": "CollectionPage",
            name: title,
            description,
            url,
            inLanguage: "ms-MY",
          }),
        }}
      />
    </>
  )
}


