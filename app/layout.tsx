import type React from "react";
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import MobileTabBar from "@/components/mobile-tabbar";
import DesktopNavbar from "@/components/desktop-navbar";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

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
  },
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "/",
    siteName: "Cari Pasar Malam Malaysia",
    title: "Cari Pasar Malam Malaysia",
    description:
      "Direktori pasar malam Malaysia. Cari pasar malam di seluruh negara dengan waktu operasi, kemudahan dan lokasi.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Cari pasar malam terdekat di Malaysia melalui PasarMalam.app — lengkap dengan waktu operasi, lokasi dan kemudahan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cari Pasar Malam Malaysia",
    description:
      "Direktori pasar malam Malaysia. Cari pasar malam di seluruh negara dengan waktu operasi, kemudahan dan lokasi.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  generator: "caripasarmalam",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("language")?.value;
  const headersList = await headers();
  // Accept-Language header format sample: en-US,en;q=0.9,fr;q=0.8,ms;q=0.7
  const preferredLanguage = headersList.get("accept-language")?.split(",")[0].split(";")[0].split("-")[0];
  let initialLanguage = cookieLang;
  if (!cookieLang) initialLanguage = preferredLanguage === "en" ? "en" : "ms";
  const pathname = headersList.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");
  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PasarMalam" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* JSON-LD: Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Cari Pasar Malam Malaysia",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app",
              inLanguage: "ms-MY",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app"}/markets?query={search_term_string}`,
                query: "required name=search_term_string",
              },
            }),
          }}
        />
        <Script
          defer
          src="https://umami.muaz.app/script.js"
          data-website-id="e9608536-210c-47a7-bcb3-0109c583bef9"
          strategy="afterInteractive"
        />
        <Script
          id="adsbygoogle-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3393623405576068"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ? (
          <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
        ) : null}
      </head>
      <body className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider initialLanguage={initialLanguage}>
            {!isAdmin && <DesktopNavbar />}
            <Suspense fallback={null}>
              <main className={isAdmin ? "" : "md:pb-0 pb-16"}>{children}</main>
            </Suspense>
            {!isAdmin && <MobileTabBar />}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
