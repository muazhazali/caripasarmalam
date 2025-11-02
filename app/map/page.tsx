"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, List, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MarketsMap from "@/components/markets-map"
import { type Market } from "@/lib/markets-data"
import { useLanguage } from "@/components/language-provider"
import { createBrowserSupabaseClient } from "@/lib/supabase-client"
import { getStateFromCoordinates } from "@/lib/geolocation"
import { dbRowToMarket } from "@/lib/db-transform"

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

export default function MapPage() {
  const { t } = useLanguage()
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("Semua Negeri")
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  // Fetch markets from server
  const fetchMarkets = useCallback(async (state?: string) => {
    setIsLoadingMarkets(true)
    try {
      const supabase = createBrowserSupabaseClient()
      let query = supabase.from('pasar_malams').select('*').eq('status', 'Active')

      if (state && state !== "Semua Negeri" && state !== "All States") {
        query = query.eq('state', state)
      }

      query = query.limit(1000) // Higher limit for map view

      const { data, error } = await query

      if (error) {
        console.error("Error fetching markets:", error)
        return
      }

      if (data) {
        // Transform database rows to Market objects
        const transformedMarkets = data.map(dbRowToMarket)
        setMarkets(transformedMarkets)
      }
    } catch (error) {
      console.error("Error fetching markets:", error)
    } finally {
      setIsLoadingMarkets(false)
    }
  }, [])

  // Handle state change - fetch from server
  const handleStateChange = useCallback((newState: string) => {
    setSelectedState(newState)
    fetchMarkets(newState !== "Semua Negeri" && newState !== "All States" ? newState : undefined)
  }, [fetchMarkets])

  // Get user location on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setUserLocation({ lat, lng })
          
          // Detect state and auto-filter
          const state = getStateFromCoordinates(lat, lng)
          if (state) {
            setSelectedState(state)
            fetchMarkets(state)
          } else {
            // Location outside Malaysia, fetch all
            fetchMarkets()
          }
        },
        (error) => {
          // Permission denied or unavailable - fetch all markets
          console.warn("Geolocation error:", error)
          fetchMarkets()
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    } else {
      // Geolocation not available - fetch all markets
      fetchMarkets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Filter markets client-side (search, state, and coordinates only)
  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      searchQuery === "" ||
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.state.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesState = selectedState === "Semua Negeri" || selectedState === "All States" || market.state === selectedState

    // Only show markets with coordinates
    return matchesSearch && matchesState && market.location
  })

  return (
    <div className="min-h-screen bg-background">
      

      {/* Search Controls */}
      <div className="border-b border-border bg-card relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                className="pl-10 h-10 md:h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedState} onValueChange={handleStateChange} disabled={isLoadingMarkets}>
              <SelectTrigger className="w-48 h-10 md:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                {malaysianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {isLoadingMarkets ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading markets...
              </span>
            ) : (
              <span>{t.showingResults} {filteredMarkets.length} {t.markets}</span>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-180px)] relative z-0">
        <MarketsMap
          markets={filteredMarkets}
          selectedMarket={selectedMarket}
          onMarketSelect={setSelectedMarket}
          className="h-full"
        />
      </div>
    </div>
  )
}


