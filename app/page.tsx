"use client"

import { useState, useMemo } from "react"
import {
  Search,
  MapPin,
  Clock,
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
import Link from "next/link"
import { getAllMarkets } from "@/lib/markets-data"
import { useTranslation } from "@/lib/i18n"
import LanguageSwitcher from "@/components/language-switcher"

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
  const [language, setLanguage] = useState(
    typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms",
  )
  const t = useTranslation(language)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedDay, setSelectedDay] = useState("All Days")
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const findNearestMarkets = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          // Clear other filters to show nearest results
          setSearchQuery("")
          setSelectedState("All States")
          setSelectedDay("All Days")
        },
        (error) => {
          console.error("Geolocation error:", error)
          alert("Unable to get your location. Please enable location services.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t.appTitle}</h1>
              <p className="text-muted-foreground mt-1">{t.homeSubtitle}</p>
            </div>
            <nav className="flex gap-2 items-center">
              <Button onClick={findNearestMarkets} variant="outline" className="gap-2 bg-transparent">
                <Navigation2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t.findNearest}</span>
              </Button>
              <Link href="/markets">
                <Button variant="outline">Lihat Semua Pasar</Button>
              </Link>
              <Link href="/markets/map">
                <Button variant="outline">
                  <Map className="h-4 w-4 mr-2" />
                  {t.mapView}
                </Button>
              </Link>
              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={(code) => {
                  setLanguage(code)
                  if (typeof window !== "undefined") localStorage.setItem("language", code)
                }}
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">{t.heroTitle}</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Jelajahi pasar malam autentik Malaysia dengan maklumat waktu operasi, kemudahan dan lokasi
          </p>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 bg-transparent"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Penapis
                </Button>
              </div>

              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
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
                    <label className="text-sm font-medium text-foreground mb-2 block">Hari dalam Minggu</label>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{sampleMarkets.length}+</div>
                <div className="text-muted-foreground">Jumlah Pasar Tersenarai</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">7 Hari</div>
                <div className="text-muted-foreground">Liputan Mingguan</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">13 Negeri</div>
                <div className="text-muted-foreground">Seluruh Negara</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">
              {searchQuery || selectedState !== "All States" || selectedDay !== "All Days" || userLocation
                ? `Hasil Carian (${filteredMarkets.length})`
                : "Pasar Pilihan"}
            </h3>
            <div className="flex gap-2">
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
                  Clear Filters
                </Button>
              )}
              <Link href="/markets">
                <Button>Lihat Semua Pasar</Button>
              </Link>
            </div>
          </div>

          {filteredMarkets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t.noMarketsFound}</p>
              <p className="text-muted-foreground">{t.tryAdjustingFilters}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            {distance.toFixed(1)} km dari sini
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{market.name}</CardTitle>
                      <CardDescription>
                        {market.district} • {market.schedule[0]?.day} {market.schedule[0]?.sessions[0]?.start}-
                        {market.schedule[0]?.sessions[market.schedule[0]?.sessions.length - 1]?.end}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                            <span>Toilet</span>
                          </div>
                        )}
                        {market.amenities.prayer_room && (
                          <div className="flex items-center gap-1">
                            <Mosque className="h-4 w-4" />
                            <span>Surau</span>
                          </div>
                        )}
                      </div>
                      {market.total_shop && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {market.total_shop} stalls • {formatArea(market.area_m2)}
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
                <Button size="lg">Lihat Semua {filteredMarkets.length} Pasar</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2025 Direktori Pasar Malam Malaysia. Projek sumber terbuka untuk komuniti.</p>
        </div>
      </footer>
    </div>
  )
}
