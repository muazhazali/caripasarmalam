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
  title: "Cari Pasar Malam Malaysia",
  description: "Find night markets (pasar malam) across Malaysia with opening hours, amenities, and locations",
  generator: "v0.app",
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
    <html lang={initialLanguage}>
      <body className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${GeistMono.variable}`}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <DesktopNavbar />
          <Suspense fallback={null}>
            <main className="md:pb-0 pb-16">
              {children}
            </main>
          </Suspense>
          <MobileTabBar />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
