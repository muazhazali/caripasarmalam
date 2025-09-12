"use client"

import { useState, useMemo } from "react"
import {
  Search,
  MapPin,
  Clock,
  CalendarDays,
  Users,
  Filter,
  Car,
  PenTool as Restroom,
  MSquare as Mosque,
  Map,
  Navigation2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { getAllMarkets } from "@/lib/markets-data"
import { useLanguage } from "@/components/language-provider"

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

export default function HomePage() {
  const sampleMarkets = getAllMarkets()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedDay, setSelectedDay] = useState("All Days")
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)

  const findNearestMarkets = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsRequestingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setSearchQuery("")
        setSelectedState("All States")
        setSelectedDay("All Days")
        setIsRequestingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsRequestingLocation(false)
        // Fallback is handled by showing all markets; no blocking dialog
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const dayOrder: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  function getLocalizedDay(englishDay: string): string {
    const key = englishDay.toLowerCase() as keyof typeof t
    return (t[key] as unknown as string) || englishDay
  }

  function renderScheduleBadges(market: ReturnType<typeof getAllMarkets>[number]) {
    const ordered = [...market.schedule].sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
    )
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {ordered.map((sch) => {
          const times = sch.sessions
            .map((s) => `${s.start}–${s.end}`)
            .join(", ")
          const localizedDay = getLocalizedDay(sch.day)
          const aria = `${localizedDay}, ${times}`
          return (
            <Badge key={`${market.id}-${sch.day}`} variant="outline" className="flex items-center gap-1" aria-label={aria}>
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">{localizedDay}</span>
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
    let filtered = sampleMarkets.filter((market) => {
      const matchesSearch =
        searchQuery === "" ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.state.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesState = selectedState === "All States" || market.state === selectedState

      const matchesDay = selectedDay === "All Days" || market.schedule.some((schedule) => schedule.day === selectedDay)

      return matchesSearch && matchesState && matchesDay
    })

    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        const distanceA = a.location
          ? calculateDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude)
          : Number.POSITIVE_INFINITY
        const distanceB = b.location
          ? calculateDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude)
          : Number.POSITIVE_INFINITY
        return distanceA - distanceB
      })
    }

    return filtered
  }, [searchQuery, selectedState, selectedDay, userLocation])

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
                <div className="hidden md:block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 bg-transparent"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    {t.filters}
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="hidden md:flex md:flex-row gap-4 p-4 bg-card rounded-lg border">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">{t.state}</label>
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
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">{t.dayOfWeekLabel}</label>
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
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats (desktop only) */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-3 md:p-4 text-center">
                <MapPin className="h-6 w-6 text-primary mx-auto mb-1.5" />
                <div className="text-xl font-bold text-foreground">{sampleMarkets.length}+</div>
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
              {searchQuery || selectedState !== "All States" || selectedDay !== "All Days" || userLocation
                ? `${t.searchResults} (${filteredMarkets.length})`
                : t.featuredMarkets}
            </h3>
            <div className="hidden md:flex gap-2">
              {(searchQuery || selectedState !== "All States" || selectedDay !== "All Days" || userLocation) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedState("All States")
                    setSelectedDay("All Days")
                    setUserLocation(null)
                  }}
                >
                  {t.clearAllFilters}
                </Button>
              )}
              <Link href="/markets">
                <Button>{t.viewAllMarkets}</Button>
              </Link>
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

          {filteredMarkets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t.noMarketsFound}</p>
              <p className="text-muted-foreground">{t.tryAdjustingFilters}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMarkets.slice(0, 6).map((market) => {
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
                        {distance && (
                          <Badge variant="outline" className="text-xs">
                            {distance.toFixed(1)} {t.kmFromHere}
                          </Badge>
                        )}
                      </div>
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
                      <Link href={`/markets/${market.id}`}>
                        <Button className="w-full">{t.viewDetails}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {filteredMarkets.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/markets">
                <Button size="lg">{t.viewAll} {filteredMarkets.length} {t.markets}</Button>
              </Link>
            </div>
          )}
          {/* Mobile filter FAB + sheet */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button className="md:hidden fixed bottom-20 right-4 z-40 rounded-full h-12 w-12 p-0 shadow-lg">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-4">
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
                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedState("All States")
                      setSelectedDay("All Days")
                    }}
                  >
                    {t.reset}
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFilters(false)}>
                    {t.applyFilters}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">{t.footerText}</p>
        </div>
      </footer>
    </div>
  )
}
