"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslation, formatScheduleRule } from "@/lib/i18n"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Market } from "@/lib/markets-data"

interface MarketsMapProps {
  markets: Market[]
  selectedMarket?: Market | null
  onMarketSelect?: (market: Market) => void
  className?: string
}

export default function MarketsMap({ markets, selectedMarket, onMarketSelect, className = "" }: MarketsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isReady, setIsReady] = useState(false)
  const t = useTranslation(typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms")

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Geolocation error:", error)
        },
      )
    }
  }, [])

  // Initialize the map ONCE
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    let resizeObserver: ResizeObserver | null = null

    const init = async () => {
      try {
        const L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        if (!mapInstanceRef.current) {
          const map = L.map(mapRef.current).setView([3.139, 101.6869], 10)
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map)
          mapInstanceRef.current = map
          // ready after first paint
          setTimeout(() => {
            setIsReady(true)
            map.invalidateSize()
          }, 0)

          // Handle resize
          resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
          })
          if (mapRef.current) resizeObserver.observe(mapRef.current)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    init()

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when data changes without recreating the map
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return
      const map = mapInstanceRef.current
      const L = (await import("leaflet")).default

      // Remove old markers
      markersRef.current.forEach((m) => map.removeLayer(m))
      markersRef.current = []

      // User location
      if (userLocation) {
        const userIcon = L.divIcon({
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
          className: "user-location-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
        userMarker.bindPopup(`<div class="p-2"><p class="text-sm font-medium">${t.yourLocation}</p></div>`)
        markersRef.current.push(userMarker)
      }

      // Market markers
      markets.forEach((market) => {
        if (!market.location) return
        const isSelected = selectedMarket?.id === market.id
        const markerIcon = L.divIcon({
          html: `<div class="w-6 h-6 ${isSelected ? "bg-primary" : "bg-secondary"} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                   <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                   </svg>
                 </div>`,
          className: "market-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
        const marker = L.marker([market.location.latitude, market.location.longitude], { icon: markerIcon }).addTo(map)

        const locale = typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms"
        const scheduleText = market.schedule[0] ? formatScheduleRule(market.schedule[0], locale) : t.scheduleNotAvailable

        marker.bindPopup(`
          <div class="p-3 min-w-64">
            <h3 class="font-semibold text-sm mb-2">${market.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${market.district}, ${market.state}</p>
            <p class="text-xs text-gray-500 mb-2">${scheduleText}</p>
            <div class="flex gap-1 mb-2">
              ${market.parking.available ? `<span class=\"text-xs bg-green-100 text-green-800 px-1 rounded\">${t.parking}</span>` : ""}
              ${market.amenities.toilet ? `<span class=\"text-xs bg-blue-100 text-blue-800 px-1 rounded\">${t.toilet}</span>` : ""}
              ${market.amenities.prayer_room ? `<span class=\"text-xs bg-purple-100 text-purple-800 px-1 rounded\">${t.prayerRoom}</span>` : ""}
            </div>
            <button onclick=\"window.location.href='/markets/${market.id}'\" class="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90">
              ${t.viewDetails}
            </button>
          </div>
        `)

        marker.on("click", () => {
          if (onMarketSelect) onMarketSelect(market)
        })
        markersRef.current.push(marker)
      })

      // Fit bounds
      const markerCount = markersRef.current.length
      if (markerCount > 0) {
        const group = new L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    updateMarkers()
  }, [markets, selectedMarket, userLocation, onMarketSelect, t])

  const centerOnUserLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "400px" }} />

      {/* Map controls */}
      <div className="absolute top-4 right-4 space-y-2">
        {userLocation && (
          <Button size="sm" variant="secondary" onClick={centerOnUserLocation} className="shadow-lg">
            <Navigation className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Loading fallback */}
      {!isReady && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">{t.loadingMap}</p>
          </div>
        </div>
      )}

      {/* Selected market info */}
      {selectedMarket && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">{selectedMarket.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedMarket.district}, {selectedMarket.state}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {selectedMarket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {selectedMarket.parking.available && (
                    <Badge variant="outline" className="text-xs">
                      Parking
                    </Badge>
                  )}
                  {selectedMarket.amenities.toilet && (
                    <Badge variant="outline" className="text-xs">
                      Toilet
                    </Badge>
                  )}
                </div>
                <Button size="sm" asChild>
                  <a href={`/markets/${selectedMarket.id}`}>View Details</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
