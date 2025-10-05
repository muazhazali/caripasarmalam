"use client"

import { useState, use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Car,
  Toilet as Restroom,
  Home as Mosque,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMarketById } from "@/lib/markets-data"
import { useTranslation } from "@/lib/i18n"
import LanguageSwitcher from "@/components/language-switcher"
import InteractiveMap from "@/components/interactive-map"

interface MarketPageProps {
  params: Promise<{
    id: string
  }>
}

export default function MarketPage({ params }: MarketPageProps) {
  const [language, setLanguage] = useState(
    typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms",
  )
  const t = useTranslation(language)
  const resolvedParams = use(params)
  const market = getMarketById(resolvedParams.id)

  if (!market) {
    notFound()
  }

  const formatArea = (areaM2: number) => {
    if (areaM2 >= 10000) {
      return `${(areaM2 / 1000000).toFixed(2)} ${t.kmSquared}`
    }
    return `${Math.round(areaM2)} m²`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/markets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDirectory}
              </Button>
            </Link>
            <div className="flex-1">
              <nav className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  {t.home}
                </Link>
                <span className="mx-2">/</span>
                <Link href="/markets" className="hover:text-foreground">
                  {t.markets}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{market.name}</span>
              </nav>
            </div>
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={(code) => {
                setLanguage(code)
                if (typeof window !== "undefined") localStorage.setItem("language", code)
              }}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{market.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {market.district}, {market.state}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {t.active}
                </Badge>
              </div>

              {/* Description */}
              {market.description && (
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">{market.description}</p>
              )}
            </div>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.operatingSchedule}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {market.schedule.map((schedule, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="font-medium text-foreground min-w-24">
                        {schedule.days.map(day => {
                          const dayMap: { [key: string]: string } = {
                            "mon": "Isnin",
                            "tue": "Selasa", 
                            "wed": "Rabu",
                            "thu": "Khamis",
                            "fri": "Jumaat",
                            "sat": "Sabtu",
                            "sun": "Ahad"
                          }
                          return dayMap[day]
                        }).join(", ")}
                      </div>
                      <div className="flex-1">
                        {schedule.times.map((time, timeIndex) => (
                          <div key={timeIndex} className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {time.start} - {time.end}
                            </span>
                            {time.note && (
                              <Badge variant="outline" className="text-xs">
                                {t[time.note.toLowerCase().replace(/\s+/g, "") as keyof typeof t] || time.note}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities & Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>{t.amenitiesFacilities}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parking */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {t.parking}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={market.parking.available ? "default" : "secondary"}>
                          {market.parking.available ? t.available : t.notAvailable}
                        </Badge>
                        {market.parking.accessible && <Badge variant="outline">{t.accessible}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{market.parking.notes}</p>
                    </div>
                  </div>

                  {/* Other Amenities */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">{t.otherFacilities}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Restroom className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Tandas: {market.amenities.toilet ? t.available : t.notAvailable}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mosque className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t.prayerRoom}: {market.amenities.prayer_room ? t.available : t.notAvailable}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t.locationAddress}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t.fullAddress}</h4>
                    <p className="text-muted-foreground">{market.address}</p>
                  </div>

                  {market.location ? (
                    <InteractiveMap
                      latitude={market.location.latitude}
                      longitude={market.location.longitude}
                      name={market.name}
                      address={market.address}
                      className="w-full h-64"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p>{t.locationNotAvailable}</p>
                      </div>
                    </div>
                  )}

                  {market.location && (
                    <div className="flex gap-2">
                      <Button asChild variant="outline">
                        <a
                          href={market.location.gmaps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t.openInGoogleMaps}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quickInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {market.total_shop && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.totalStalls}</span>
                    <span className="font-medium">{market.total_shop}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.areaSize}</span>
                  <span className="font-medium">{formatArea(market.area_m2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.district}</span>
                  <span className="font-medium">{market.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.state}</span>
                  <span className="font-medium">{market.state}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {market.contact && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.contactInformation}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {market.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${market.contact.phone}`} className="text-primary hover:underline">
                        {market.contact.phone}
                      </a>
                    </div>
                  )}
                  {market.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${market.contact.email}`} className="text-primary hover:underline">
                        {market.contact.email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t.actions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {market.location && (
                  <Button asChild className="w-full">
                    <a href={market.location.gmaps_link} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t.getDirections}
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  {t.shareMarket}
                </Button>
              </CardContent>
            </Card>

            {/* Nearby Markets */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.otherMarketsIn} {market.state}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.discoverMoreMarkets}</p>
                <Link href={`/markets?state=${encodeURIComponent(market.state)}`}>
                  <Button variant="outline" className="w-full mt-3 bg-transparent">
                    {t.browseStateMarkets} {market.state} Markets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
