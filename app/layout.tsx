import type React from "react"
import type { Metadata } from "next"
import { Source_Sans_3 } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { cookies } from "next/headers"
import "./globals.css"
import MobileTabBar from "@/components/mobile-tabbar"
import DesktopNavbar from "@/components/desktop-navbar"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeProvider } from "@/components/theme-provider"

const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  display: "swap",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"),
  title: {
    default: "Cari Pasar Malam Malaysia | Direktori Pasar Malam Malaysia",
    template: "%s | Cari Pasar Malam Malaysia",
  },
  description:
    "Direktori pasar malam Malaysia. Cari pasar malam (night market) di seluruh Malaysia termasuk KL, Selangor, Johor, Pulau Pinang dan lain-lain. Waktu operasi, kemudahan dan lokasi.",
  keywords: [
    "pasar malam",
    "pasar malam Malaysia",
    "pasar malam KL",
    "pasar malam Kuala Lumpur",
    "pasar malam Selangor",
    "pasar malam Johor",
    "pasar malam Negeri Sembilan",
    "pasar malam Pulau Pinang",
    "night market Malaysia",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "ms-MY": "/",
      "en-MY": "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "/",
    siteName: "Cari Pasar Malam Malaysia",
    title: "Cari Pasar Malam Malaysia",
    description:
      "Direktori pasar malam Malaysia. Cari pasar malam di seluruh negara dengan waktu operasi, kemudahan dan lokasi.",
    images: [{ url: "/placeholder.jpg", width: 1200, height: 630, alt: "Cari Pasar Malam" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cari Pasar Malam Malaysia",
    description:
      "Direktori pasar malam Malaysia. Cari pasar malam di seluruh negara dengan waktu operasi, kemudahan dan lokasi.",
    images: ["/placeholder.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "caripasarmalam",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get("language")?.value
  const initialLanguage = cookieLang === "en" ? "en" : "ms"
  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <head>
        {/* JSON-LD: Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Cari Pasar Malam Malaysia",
              url: (process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"),
              inLanguage: "ms-MY",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"}/markets?query={search_term_string}`,
                query: "required name=search_term_string",
              },
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ? (
          <meta
            name="google-adsense-account"
            content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
          />
        ) : null}
      </head>
      <body className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${GeistMono.variable}`}>
         <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider initialLanguage={initialLanguage}>
          <DesktopNavbar />
          <Suspense fallback={null}>
            <main className="md:pb-0 pb-16">
              {children}
            </main>
          </Suspense>
          <MobileTabBar />
        </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
