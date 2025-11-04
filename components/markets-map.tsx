"use client"

import { useEffect, useRef, useState } from "react"
import { formatScheduleRule } from "@/lib/i18n"
import { useLanguage } from "@/components/language-provider"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import openDirections from "@/lib/directions"
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
  const lightTilesRef = useRef<any | null>(null)
  const darkTilesRef = useRef<any | null>(null)
  const hasUserInteractedRef = useRef<boolean>(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isUpdating, setIsUpdating] = useState(true)
  const [useDarkTiles, setUseDarkTiles] = useState<boolean>(false)
  const { t, language } = useLanguage()
  const { theme, systemTheme } = useTheme()

  function resolveIsDark(): boolean {
    const pref = theme === "system" ? systemTheme : theme
    if (pref === "dark") return true
    if (pref === "light") return false
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  }

  useEffect(() => {
    const resolved = resolveIsDark()
    setUseDarkTiles(resolved)
    // If map already exists, swap tile layers to match the theme
    if (!mapInstanceRef.current || !lightTilesRef.current || !darkTilesRef.current) return
    try {
      if (resolved) {
        if (lightTilesRef.current) mapInstanceRef.current.removeLayer(lightTilesRef.current)
        darkTilesRef.current.addTo(mapInstanceRef.current)
      } else {
        if (darkTilesRef.current) mapInstanceRef.current.removeLayer(darkTilesRef.current)
        lightTilesRef.current.addTo(mapInstanceRef.current)
      }
    } catch (_) {
      /* ignore */
    }
  }, [theme, systemTheme, isReady])

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
          // Initialize map with center and zoom so subsequent flyTo calls are safe
          const map = L.map(mapRef.current).setView([3.139, 101.6869], 10)
          // Prepare light and dark tile layers
          lightTilesRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          })
          darkTilesRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          })
          const resolvedDark = (() => {
            const pref = (theme === "system" ? systemTheme : theme) as string | undefined
            if (pref === "dark") return true
            if (pref === "light") return false
            if (typeof window !== "undefined" && window.matchMedia) {
              return window.matchMedia("(prefers-color-scheme: dark)").matches
            }
            return false
          })()
          if (resolvedDark && darkTilesRef.current) darkTilesRef.current.addTo(map)
          else if (lightTilesRef.current) lightTilesRef.current.addTo(map)
          mapInstanceRef.current = map
          // Track interaction to preserve viewport
          map.on("zoomstart", () => {
            hasUserInteractedRef.current = true
          })
          map.on("dragstart", () => {
            hasUserInteractedRef.current = true
          })
          // Expose the shared helper on window for popup markup (popup HTML calls window.openDirections)
          if (typeof window !== "undefined") {
            ;(window as any).openDirections = openDirections
          }
          // ready after first paint
          setTimeout(() => {
            setIsReady(true)
            map.invalidateSize()
            setIsUpdating(false)
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
      setIsUpdating(true)
      if (!mapInstanceRef.current) {
        // Map not yet initialized — don't leave the UI stuck in updating state
        setIsUpdating(false)
        return
      }
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

  const scheduleText = market.schedule[0] ? formatScheduleRule(market.schedule[0], language) : t.scheduleNotAvailable

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
            <div class="flex gap-2">
              <button onclick=\"window.openDirections(${market.location.latitude}, ${market.location.longitude})\" class=\"text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90\">${t.getDirections}</button>
              <button onclick=\"window.location.href='/markets/${market.id}'\" class=\"text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90\">${t.viewDetails}</button>
            </div>
          </div>
        `)

        // If this market is currently selected, open its popup so the user sees details
        if (isSelected) {
          marker.openPopup()
        }

        marker.on("click", () => {
          // Always center on clicked marker immediately so the user sees it,
          // even if the parent state doesn't change (same object reference).
          if (market.location && map) {
            try {
              map.flyTo([market.location.latitude, market.location.longitude], 15, { animate: true, duration: 0.8 })
            } catch (e) {
              /* ignore */
            }
          }
          if (onMarketSelect) onMarketSelect(market)
        })
        markersRef.current.push(marker)
      })

      // Fit bounds or center on selected market
      const markerCount = markersRef.current.length
      if (markerCount > 0) {
        const group = new L.featureGroup(markersRef.current)
        if (selectedMarket && selectedMarket.location) {
          // Center on the selected market instead of fitting all markers
          map.flyTo([selectedMarket.location.latitude, selectedMarket.location.longitude], 15, { animate: true, duration: 0.8 })
        } else if (!hasUserInteractedRef.current) {
          map.fitBounds(group.getBounds().pad(0.1))
        }
      }
      setIsUpdating(false)
    }

    updateMarkers()
  // Also re-run when the map is ready so markers are added after initialization
  }, [markets, selectedMarket, userLocation, onMarketSelect, t, isReady])

  const centerOnUserLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true, duration: 0.8 })
      } catch (e) {
        /* ignore */
      }
    }
  }

  const fitToMarkers = async () => {
    if (!mapInstanceRef.current || markersRef.current.length === 0) return
    const L = (await import("leaflet")).default
    const group = new L.featureGroup(markersRef.current)
    try {
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    } catch (e) {
      /* ignore */
    }
  }

  const zoomIn = () => {
    if (!mapInstanceRef.current) return
    try {
      mapInstanceRef.current.zoomIn()
    } catch (e) {
      /* ignore */
    }
  }

  const zoomOut = () => {
    if (!mapInstanceRef.current) return
    try {
      mapInstanceRef.current.zoomOut()
    } catch (e) {
      /* ignore */
    }
  }

  // Theme is handled automatically via next-themes effect above

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "400px" }} />

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1001]">
        {userLocation && (
          <Button
            size="sm"
            variant="default"
            onClick={centerOnUserLocation}
            className="shadow-lg"
            aria-label="Locate me"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}
        <Button size="sm" variant="default" onClick={zoomIn} className="shadow-lg" aria-label="Zoom in">
          +
        </Button>
        <Button size="sm" variant="default" onClick={zoomOut} className="shadow-lg" aria-label="Zoom out">
          −
        </Button>
        <Button size="sm" variant="default" onClick={fitToMarkers} className="shadow-lg" aria-label="Fit to markers">
          Fit
        </Button>
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

      {/* Updating indicator (non-blocking) */}
      {isReady && isUpdating && (
        <div className="absolute top-4 left-4 z-[1001] flex items-center gap-2 rounded-md bg-card/90 border px-3 py-1.5 text-sm text-muted-foreground pointer-events-none shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t.loadingMap}</span>
        </div>
      )}

      {/* Selected market bottom card removed per requirement */}
    </div>
  )
}
