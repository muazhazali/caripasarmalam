"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Car,
  Toilet as Restroom,
  Home as Mosque,
  ArrowUpDown,
  Grid,
  List,
  Map,
  Navigation2,
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

export default function MarketsPage() {
  const sampleMarkets = getAllMarkets()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedDay, setSelectedDay] = useState("All Days")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list") // Default to list view for better UX
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [filters, setFilters] = useState({
    parking: false,
    toilet: false,
    prayer_room: false,
    accessible_parking: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  const findNearestMarkets = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setSortBy("distance")
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

  const filteredAndSortedMarkets = useMemo(() => {
    const filtered = sampleMarkets.filter((market) => {
      const matchesSearch =
        searchQuery === "" ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.address.toLowerCase().includes(searchQuery.toLowerCase())

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

      return matchesSearch && matchesState && matchesDay && matchesFilters
    })

    // Sort markets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "state":
          return a.state.localeCompare(b.state) || a.district.localeCompare(b.district)
        case "size":
          return (b.total_shop || 0) - (a.total_shop || 0)
        case "area":
          return b.area_m2 - a.area_m2
        case "distance":
          if (!userLocation) return 0
          const distanceA = a.location
            ? calculateDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude)
            : Number.POSITIVE_INFINITY
          const distanceB = b.location
            ? calculateDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude)
            : Number.POSITIVE_INFINITY
          return distanceA - distanceB
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedState, selectedDay, sortBy, filters, userLocation])

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedState("All States")
    setSelectedDay("All Days")
    setFilters({
      parking: false,
      toilet: false,
      prayer_room: false,
      accessible_parking: false,
    })
  }

  const formatArea = (areaM2: number) => {
    if (areaM2 >= 10000) {
      return `${(areaM2 / 1000000).toFixed(2)} ${t.kmSquared}`
    }
    return `${Math.round(areaM2)} m²`
  }

  return (
    <div className="min-h-screen bg-background">
      

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 h-11 md:h-12 text-base md:text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-48">
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
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-40">
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

          {/* Advanced Filters (desktop) */}
          <Card className="mb-6 hidden md:block">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t.filtersAmenities}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    {t.clearAllFilters}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={filters.parking}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, parking: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="parking"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.parkingAvailable}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessible-parking"
                    checked={filters.accessible_parking}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, accessible_parking: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="accessible-parking"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.accessibleParking}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="toilet"
                    checked={filters.toilet}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, toilet: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="toilet"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.toiletFacilities}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prayer-room"
                    checked={filters.prayer_room}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, prayer_room: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="prayer-room"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.prayerRoom}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t.directoryTitle}</h2>
                <p className="text-muted-foreground">
                  {t.showingResults} {filteredAndSortedMarkets.length} {t.of} {sampleMarkets.length} {t.markets}
                </p>
              </div>
              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t.sortByName}</SelectItem>
                    <SelectItem value="state">{t.sortByLocation}</SelectItem>
                    <SelectItem value="size">{t.sortByStallCount}</SelectItem>
                    <SelectItem value="area">{t.sortByAreaSize}</SelectItem>
                    {userLocation && <SelectItem value="distance">{t.sortByDistance}</SelectItem>}
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="mt-3 grid grid-cols-1 gap-2 md:hidden">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 w-full text-base">
                  <ArrowUpDown className="h-5 w-5 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t.sortByName}</SelectItem>
                  <SelectItem value="state">{t.sortByLocation}</SelectItem>
                  <SelectItem value="size">{t.sortByStallCount}</SelectItem>
                  <SelectItem value="area">{t.sortByAreaSize}</SelectItem>
                  {userLocation && <SelectItem value="distance">{t.sortByDistance}</SelectItem>}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className="h-11 flex-1 rounded-none"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className="h-11 flex-1 rounded-none border-l"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredAndSortedMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">{t.noMarketsFound}</p>
            <p className="text-muted-foreground mb-4">{t.tryAdjustingFilters}</p>
            <Button onClick={clearAllFilters}>{t.clearAllFilters}</Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAndSortedMarkets.map((market) => {
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
                <Card
                  key={market.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    viewMode === "list" ? "flex flex-col" : ""
                  }`}
                >
                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{market.name}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{market.state}</Badge>
                            {distance && (
                              <Badge variant="outline" className="text-xs">
                                {distance.toFixed(1)} {t.kmFromHere}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {market.district} • {market.schedule[0]?.days[0] && (() => {
                              const dayMap: { [key: string]: string } = {
                                "mon": "Isnin",
                                "tue": "Selasa", 
                                "wed": "Rabu",
                                "thu": "Khamis",
                                "fri": "Jumaat",
                                "sat": "Sabtu",
                                "sun": "Ahad"
                              }
                              return dayMap[market.schedule[0].days[0]]
                            })()} {market.schedule[0]?.times[0]?.start}-
                            {market.schedule[0]?.times[market.schedule[0]?.times.length - 1]?.end}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{market.address}</p>

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

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        {market.total_shop && (
                          <div>
                            <span className="font-medium">{t.totalStalls}:</span>
                            <br />
                            <span>{market.total_shop}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{t.areaSize}:</span>
                          <br />
                          <span>{formatArea(market.area_m2)}</span>
                        </div>
                      </div>

                      <Link href={`/markets/${market.id}`}>
                        <Button className="w-full">{t.viewDetails}</Button>
                      </Link>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Mobile FAB + filter sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetTrigger asChild>
          <Button className="md:hidden fixed bottom-20 right-4 z-40 rounded-full h-12 w-12 p-0 shadow-lg">
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
                  id="m-parking"
                  checked={filters.parking}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, parking: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                />
                <label htmlFor="m-parking" className="text-sm font-medium">
                  {t.parkingAvailable}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="m-accessible-parking"
                  checked={filters.accessible_parking}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, accessible_parking: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                />
                <label htmlFor="m-accessible-parking" className="text-sm font-medium">
                  {t.accessibleParking}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="m-toilet"
                  checked={filters.toilet}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, toilet: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                />
                <label htmlFor="m-toilet" className="text-sm font-medium">
                  {t.toiletFacilities}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="m-prayer-room"
                  checked={filters.prayer_room}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, prayer_room: !!checked }))}
                    className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                />
                <label htmlFor="m-prayer-room" className="text-sm font-medium">
                  {t.prayerRoom}
                </label>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearAllFilters}>
                {t.clearAllFilters}
              </Button>
              <Button className="flex-1" onClick={() => setShowFilters(false)}>
                {t.applyFilters}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
