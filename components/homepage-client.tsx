"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search,
  MapPin,
  Clock,
  CalendarDays,
  Users,
  Car,
  Toilet as Restroom,
  Home as Mosque,
  Navigation2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { getAllMarkets, Market } from "@/lib/markets-data"
import { formatScheduleRule, formatWeekday } from "@/lib/i18n"
import { useLanguage } from "@/components/language-provider"
import { getMarketOpenStatus } from "@/lib/utils"


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

interface HomepageClientProps {
  markets: Market[]
}

const malaysianStates = [
  "Semua Negeri",
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
]

const daysOfWeek = ["Semua Hari", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"]

export default function HomepageClient({ markets }: HomepageClientProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [sortBy, setSortBy] = useState("smart")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedDay, setSelectedDay] = useState("All Days")
  const [openNow, setOpenNow] = useState<boolean>(false)
  const [filters, setFilters] = useState({
    parking: false,
    toilet: false,
    prayer_room: false,
    accessible_parking: false,
  })
  const [showFilters, setShowFilters] = useState(false)
  const suggestFormUrl = process.env.NEXT_PUBLIC_SUGGEST_MARKET_URL || "https://forms.gle/your-form"

  const findNearestMarkets = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // Geolocation not available; silently skip
      return
    }

    setIsRequestingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setSearchQuery("")
        setIsRequestingLocation(false)
      },
      (error) => {
        // Permission denied, unavailable, or timeout; silently skip
        console.warn("Geolocation error:", error)
        setIsRequestingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedState("All States")
    setSelectedDay("All Days")
    setOpenNow(false)
    setFilters({
      parking: false,
      toilet: false,
      prayer_room: false,
      accessible_parking: false,
    })
  }

  // Attempt to get nearest market on first load. If location unavailable/denied, do nothing.
  useEffect(() => {
    if (!userLocation) findNearestMarkets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dayOrderCodes: string[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

  function getLocalizedDayFromCode(code: string): string {
    // Map code to localized label via i18n helpers
    const locale = typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms"
    return formatWeekday(code as any, locale)
  }

  function renderScheduleBadges(market: Market) {
    const ordered = [...market.schedule].sort((a, b) => {
      const aIdx = Math.min(
        ...a.days.map((d) => dayOrderCodes.indexOf(d)).filter((i) => i >= 0),
      )
      const bIdx = Math.min(
        ...b.days.map((d) => dayOrderCodes.indexOf(d)).filter((i) => i >= 0),
      )
      return aIdx - bIdx
    })
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {ordered.map((sch) => {
          const locale = typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms"
          const times = sch.times.map((s) => `${s.start}–${s.end}`).join(", ")
          const dayLabel = sch.days.map((d) => getLocalizedDayFromCode(d)).join(", ")
          const aria = `${dayLabel}, ${times}`
          return (
            <Badge key={`${market.id}-${sch.days.join('-')}`} variant="outline" className="flex items-center gap-1" aria-label={aria}>
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">{dayLabel}</span>
              <span className="text-muted-foreground">•</span>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">{times}</span>
            </Badge>
          )
        })}
      </div>
    )
  }

  const filteredMarkets = useMemo(() => {
    let filtered = markets.filter((market) => {
      const matchesSearch =
        searchQuery === "" ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.state.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesState = selectedState === "All States" || market.state === selectedState

      const matchesDay = selectedDay === "All Days" || market.schedule.some((schedule) => schedule.days.some(day => {
        const dayMap: { [key: string]: string } = {
          "Isnin": "mon",
          "Selasa": "tue", 
          "Rabu": "wed",
          "Khamis": "thu",
          "Jumaat": "fri",
          "Sabtu": "sat",
          "Ahad": "sun"
        }
        return dayMap[selectedDay] === day
      }))

      const matchesFilters =
        (!filters.parking || market.parking.available) &&
        (!filters.toilet || market.amenities.toilet) &&
        (!filters.prayer_room || market.amenities.prayer_room) &&
        (!filters.accessible_parking || market.parking.accessible)

      const matchesOpen = !openNow || getMarketOpenStatus(market).status === "open"

      return matchesSearch && matchesState && matchesDay && matchesFilters && matchesOpen
    })

    // Sort by selected criteria and order
    filtered = filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "smart":
          // Multi-tier sort: Open status first, then distance, then name
          const aOpen = getMarketOpenStatus(a).status === "open"
          const bOpen = getMarketOpenStatus(b).status === "open"
          
          // Primary: Open status (open markets first)
          if (aOpen !== bOpen) {
            comparison = aOpen ? -1 : 1
          } else if (userLocation) {
            // Secondary: Distance from user (if location available)
            const distanceA = a.location
              ? calculateDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude)
              : Number.POSITIVE_INFINITY
            const distanceB = b.location
              ? calculateDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude)
              : Number.POSITIVE_INFINITY
            comparison = distanceA - distanceB
          } else {
            // Tertiary: Name (alphabetical)
            comparison = a.name.localeCompare(b.name)
          }
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "state":
          comparison = a.state.localeCompare(b.state) || a.district.localeCompare(b.district)
          break
        case "size":
          comparison = (b.total_shop || 0) - (a.total_shop || 0)
          break
        case "area":
          comparison = b.area_m2 - a.area_m2
          break
        case "distance":
          if (userLocation) {
            const distanceA = a.location
              ? calculateDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude)
              : Number.POSITIVE_INFINITY
            const distanceB = b.location
              ? calculateDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude)
              : Number.POSITIVE_INFINITY
            comparison = distanceA - distanceB
          } else {
            comparison = a.name.localeCompare(b.name)
          }
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [searchQuery, userLocation, sortBy, sortOrder, markets, selectedState, selectedDay, filters, openNow])

  const formatArea = (areaM2: number) => {
    if (areaM2 >= 10000) {
      return `${(areaM2 / 1000000).toFixed(2)} ${t.kmSquared}`
    }
    return `${Math.round(areaM2)} m²`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 text-balance">{t.heroTitle}</h2>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto text-pretty">
            {t.heroDescription}
          </p>

          <div className="max-w-4xl mx-auto mb-4 md:mb-8">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    className="pl-10 h-11 md:h-12 text-base md:text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Quick Stats (desktop only) */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-3 md:p-4 text-center">
                <MapPin className="h-6 w-6 text-primary mx-auto mb-1.5" />
                <div className="text-xl font-bold text-foreground">{markets.length}+</div>
                <div className="text-muted-foreground text-sm">{t.statsMarketsListed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-1.5" />
                <div className="text-xl font-bold text-foreground">7 {t.days}</div>
                <div className="text-muted-foreground text-sm">{t.statsWeeklyCoverage}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-1.5" />
                <div className="text-xl font-bold text-foreground">13 {t.states}</div>
                <div className="text-muted-foreground text-sm">{t.statsNationwide}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {searchQuery || userLocation
                ? `${t.searchResults} (${filteredMarkets.length})`
                : t.featuredMarkets}
            </h3>
            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button className="md:hidden rounded-full h-10 w-10 p-0 shadow-lg">
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[75vh] p-4">
                  <SheetHeader>
                    <SheetTitle>{t.filters}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">{t.stateLabel}</label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {malaysianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state === "All States" ? t.allStates : state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">{t.dayLabel}</label>
                      <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day === "All Days" ? t.allDays : t[day.toLowerCase() as keyof typeof t] || day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking"
                          checked={filters.parking}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({ ...prev, parking: checked as boolean }))
                          }
                        />
                        <label htmlFor="parking" className="text-sm font-medium">
                          {t.parking}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="toilet"
                          checked={filters.toilet}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({ ...prev, toilet: checked as boolean }))
                          }
                        />
                        <label htmlFor="toilet" className="text-sm font-medium">
                          {t.toilet}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prayer_room"
                          checked={filters.prayer_room}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({ ...prev, prayer_room: checked as boolean }))
                          }
                        />
                        <label htmlFor="prayer_room" className="text-sm font-medium">
                          {t.prayerRoom}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accessible_parking"
                          checked={filters.accessible_parking}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({ ...prev, accessible_parking: checked as boolean }))
                          }
                        />
                        <label htmlFor="accessible_parking" className="text-sm font-medium">
                          {t.accessibleParking}
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                        {t.clearAllFilters}
                      </Button>
                      <Button onClick={() => setShowFilters(false)} className="flex-1">
                        {t.applyFilters}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart">Smart Sort (Open + Nearest)</SelectItem>
                  <SelectItem value="name">{t.sortByName}</SelectItem>
                  <SelectItem value="state">{t.sortByLocation}</SelectItem>
                  <SelectItem value="size">{t.sortByStallCount}</SelectItem>
                  <SelectItem value="area">{t.sortByAreaSize}</SelectItem>
                  {userLocation && <SelectItem value="distance">{t.sortByDistance}</SelectItem>}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3"
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
              {(searchQuery || userLocation) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setUserLocation(null)
                  }}
                >
                  {t.clearAllFilters}
                </Button>
              )}
              <Link href="/markets">
                <Button>{t.viewAllMarkets}</Button>
              </Link>
              <Button asChild variant="outline" className="bg-transparent">
                <a href={suggestFormUrl} target="_blank" rel="noopener noreferrer">
                  {t.suggestMarket}
                </a>
              </Button>
            </div>
          </div>

          {/* Nearest CTA card (shown when no location yet) */}
          {!userLocation && (
            <Card className="mb-6 md:mb-8">
              <CardContent className="p-4 md:p-6 flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="font-semibold text-foreground">{t.findNearestTitle}</div>
                  <div className="text-sm text-muted-foreground">{t.findNearestDescription}</div>
                </div>
                <Button onClick={findNearestMarkets} disabled={isRequestingLocation} className="gap-2">
                  <Navigation2 className="h-4 w-4" />
                  {isRequestingLocation ? t.searching : t.findNearest}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Suggest Market CTA (mobile emphasis) */}
          <Card className="mb-6 md:hidden">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="font-semibold text-foreground">{t.suggestMarket}</div>
                <div className="text-sm text-muted-foreground">{t.addMarketCta}</div>
              </div>
              <Button asChild>
                <a href={suggestFormUrl} target="_blank" rel="noopener noreferrer">
                  {t.suggestMarket}
                </a>
              </Button>
            </CardContent>
          </Card>

          {filteredMarkets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t.noMarketsFound}</p>
              <p className="text-muted-foreground">{t.tryAdjustingFilters}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMarkets.slice(0, 100).map((market) => {
                const distance =
                  userLocation && market.location
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        market.location.latitude,
                        market.location.longitude,
                      )
                    : null

                return (
                  <Card key={market.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{market.state}</Badge>
                        {(() => {
                          const status = getMarketOpenStatus(market)
                          if (status.status === "open") {
                            return (
                              <Badge className="bg-green-600 text-white border-transparent">{t.openNow}</Badge>
                            )
                          }
                          return (
                            <Badge variant="outline" className="text-xs">{t.closedNow}</Badge>
                          )
                        })()}
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
                    <CardContent>
                      {renderScheduleBadges(market)}
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
                      {market.total_shop && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {market.total_shop} {t.totalStalls.toLowerCase()} • {formatArea(market.area_m2)}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {market.location?.gmaps_link && (
                          <Button asChild className="flex-1">
                            <a 
                              href={market.location.gmaps_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {t.showDirection}
                            </a>
                          </Button>
                        )}
                        <Link href={`/markets/${market.id}`}>
                          <Button variant="outline" >
                            {t.viewDetails}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {filteredMarkets.length > 100 && (
            <div className="text-center mt-8">
              <Link href="/markets">
                <Button size="lg">{t.viewAll} {filteredMarkets.length} {t.markets}</Button>
              </Link>
            </div>
          )}
          {/* Mobile sort controls */}
          <div className="md:hidden mb-4">
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart">Smart Sort (Open + Nearest)</SelectItem>
                  <SelectItem value="name">{t.sortByName}</SelectItem>
                  <SelectItem value="state">{t.sortByLocation}</SelectItem>
                  <SelectItem value="size">{t.sortByStallCount}</SelectItem>
                  <SelectItem value="area">{t.sortByAreaSize}</SelectItem>
                  {userLocation && <SelectItem value="distance">{t.sortByDistance}</SelectItem>}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3"
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>


        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-muted-foreground">{t.footerText}</p>
          <p className="text-xs text-muted-foreground">
            <a 
              href="https://www.flaticon.com/free-icon/shop_5193727?term=location&related_id=5193727" 
              title="maps-and-location icons"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t.flaticonAttribution}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
