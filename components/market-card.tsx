"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, Toilet as Restroom, Home as Mosque, CalendarDays, Clock } from "lucide-react"
import type { Market } from "@/lib/markets-data"
import { useLanguage } from "@/components/language-provider"
import { getMarketOpenStatus } from "@/lib/utils"
import { formatWeekday } from "@/lib/i18n"

interface MarketCardProps {
  market: Market
  userLocation?: { lat: number; lng: number } | null
  showAddress?: boolean
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function isPositiveNumber(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const n = typeof value === "string" ? Number(value) : (value as number)
  if (Number.isNaN(n)) return false
  return n > 0
}

export function MarketCard({ market, userLocation, showAddress = false }: MarketCardProps) {
  const { t } = useLanguage()

  const distance =
    userLocation && market.location
      ? calculateDistance(userLocation.lat, userLocation.lng, market.location.latitude, market.location.longitude)
      : null

  const dayOrderCodes: string[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  function getLocalizedDayFromCode(code: string): string {
    const locale = typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms"
    return formatWeekday(code as any, locale)
  }

  const orderedSchedule = [...market.schedule].sort((a, b) => {
    const aIdx = Math.min(...a.days.map((d) => dayOrderCodes.indexOf(d)).filter((i) => i >= 0))
    const bIdx = Math.min(...b.days.map((d) => dayOrderCodes.indexOf(d)).filter((i) => i >= 0))
    return aIdx - bIdx
  })

  function formatArea(areaM2: number) {
    if (!isPositiveNumber(areaM2)) return ""
    if (areaM2 >= 10000) return `${(areaM2 / 1000000).toFixed(2)} ${t.kmSquared}`
    return `${Math.round(areaM2)} m²`
  }

  const status = getMarketOpenStatus(market)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary">{market.state}</Badge>
          {status.status === "open" ? (
            <Badge className="bg-green-600 text-white border-transparent">{t.openNow}</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">{t.closedNow}</Badge>
          )}
        </div>
        {distance && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {distance.toFixed(1)} {t.kmFromHere}
            </Badge>
          </div>
        )}
        <CardTitle className="text-lg">{market.name}</CardTitle>
        <CardDescription>
          {market.district}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {/* Schedule badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {orderedSchedule.map((sch) => {
            const locale = typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms"
            const times = sch.times.map((s) => `${s.start}–${s.end}`).join(", ")
            const dayLabel = sch.days.map((d) => getLocalizedDayFromCode(d)).join(", ")
            const aria = `${dayLabel}, ${times}`
            return (
              <Badge key={`${market.id}-${sch.days.join('-')}`} variant="outline" className="flex items-center gap-1 whitespace-normal break-words" aria-label={aria}>
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="whitespace-normal break-words">{dayLabel}</span>
                <span className="text-muted-foreground">•</span>
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="whitespace-normal break-words">{times}</span>
              </Badge>
            )
          })}
        </div>

        {showAddress && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{market.address}</p>
        )}

        {/* Amenities */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          {market.parking.available && (
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>{t.parking}</span>
            </div>
          )}
          {market.amenities.toilet && (
            <div className="flex items-center gap-1">
              <Restroom className="h-4 w-4" />
              <span>{t.toilet}</span>
            </div>
          )}
          {market.amenities.prayer_room && (
            <div className="flex items-center gap-1">
              <Mosque className="h-4 w-4" />
              <span>{t.prayerRoom}</span>
            </div>
          )}
        </div>

        {/* Size/area line: show only valid values, joined with dot */}
        {(isPositiveNumber(market.total_shop) || isPositiveNumber(market.area_m2)) && (
          <p className="text-sm text-muted-foreground mb-4">
            {[
              isPositiveNumber(market.total_shop) ? `${market.total_shop} ${t.totalStalls.toLowerCase()}` : null,
              isPositiveNumber(market.area_m2) ? `${formatArea(market.area_m2)}` : null,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>
        )}

        {/* Spacer to push actions to bottom for consistent alignment */}
        <div className="mt-auto" />

        <div className="flex gap-2">
          {market.location?.gmaps_link && (
            <Button asChild className="flex-1">
              <a href={market.location.gmaps_link} target="_blank" rel="noopener noreferrer">
                {t.showDirection}
              </a>
            </Button>
          )}
          <Link href={`/markets/${market.id}`}>
            <Button variant="outline">
              {t.viewDetails}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default MarketCard


