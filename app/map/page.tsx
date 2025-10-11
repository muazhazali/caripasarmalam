"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, List, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MarketsMap from "@/components/markets-map"
import { getAllMarkets, type Market } from "@/lib/markets-data"
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

export default function MapPage() {
  const allMarkets = getAllMarkets()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  // Match the options list default to avoid filtering everything out
  const [selectedState, setSelectedState] = useState("Semua Negeri")
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const filteredMarkets = allMarkets.filter((market) => {
    const matchesSearch =
      searchQuery === "" ||
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.state.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesState = selectedState === "Semua Negeri" || market.state === selectedState

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
            <Select value={selectedState} onValueChange={setSelectedState}>
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
          <div className="mt-2 text-sm text-muted-foreground">{t.showingResults} {filteredMarkets.length} {t.markets}</div>
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


