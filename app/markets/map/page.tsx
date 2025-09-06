"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, List, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MarketsMap from "@/components/markets-map"
import { getAllMarkets, type Market } from "@/lib/markets-data"

const malaysianStates = [
  "All States",
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Malacca",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
]

export default function MarketsMapPage() {
  const allMarkets = getAllMarkets()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const filteredMarkets = allMarkets.filter((market) => {
    const matchesSearch =
      searchQuery === "" ||
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.state.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesState = selectedState === "All States" || market.state === selectedState

    return matchesSearch && matchesState && market.location
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/markets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Markets Map</h1>
              <p className="text-muted-foreground">Explore night markets across Malaysia</p>
            </div>
            <Link href="/markets">
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Controls */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search markets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {malaysianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Showing {filteredMarkets.length} markets on map</div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-200px)]">
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
