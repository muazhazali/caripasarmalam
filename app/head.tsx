export default function Head() {
  const title = "Cari Pasar Malam Malaysia | Direktori Pasar Malam Malaysia";
  const description =
    "Cari pasar malam di Malaysia (KL, Selangor, Johor, Pulau Pinang, Negeri Sembilan dan lain-lain). Waktu operasi, kemudahan, alamat dan lokasi peta.";
  const keywords = [
    "pasar malam",
    "pasar malam Malaysia",
    "pasar malam KL",
    "pasar malam Selangor",
    "pasar malam Johor",
    "pasar malam Negeri",
    "direktori pasar malam",
    "night market Malaysia",
  ].join(", ");
  const url = (process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app") + "/";
  const image = "/opengraph-image.png";
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
      <link rel="alternate" hrefLang="ms-MY" href={url} />
      <link rel="alternate" hrefLang="en-MY" href={`${url}?lang=en`} />
    </>
  );
}
