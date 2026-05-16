"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatScheduleRule } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";
import { getMarketOpenStatus } from "@/lib/utils";
import { Clock, Loader2, LocateFixed, MapPin, Maximize2, Minus, Navigation, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import openDirections from "@/lib/directions";
import { Button } from "@/components/ui/button";
import type { Market } from "@/lib/markets-data";
import type { Map, Marker, TileLayer } from "leaflet";

// Extend Window interface to include openDirections
declare global {
  interface Window {
    openDirections: typeof openDirections;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const OPENING_SOON_MINUTES = 120;

type MarketMapStatus = "open" | "opening-soon" | "closed";

const statusStyles: Record<MarketMapStatus, { color: string; ring: string; pulse: string; zIndex: number }> = {
  open: {
    color: "#16a34a",
    ring: "rgba(22, 163, 74, 0.3)",
    pulse: "rgba(22, 163, 74, 0.18)",
    zIndex: 650,
  },
  "opening-soon": {
    color: "#f59e0b",
    ring: "rgba(245, 158, 11, 0.35)",
    pulse: "rgba(245, 158, 11, 0.16)",
    zIndex: 620,
  },
  closed: {
    color: "#64748b",
    ring: "rgba(100, 116, 139, 0.24)",
    pulse: "transparent",
    zIndex: 580,
  },
};

function getMapStatus(market: Market): ReturnType<typeof getMarketOpenStatus> & { mapStatus: MarketMapStatus } {
  const openStatus = getMarketOpenStatus(market);
  const isOpeningSoon =
    openStatus.status === "closed" &&
    typeof openStatus.minutesUntilNextOpen === "number" &&
    openStatus.minutesUntilNextOpen <= OPENING_SOON_MINUTES;

  return {
    ...openStatus,
    mapStatus: openStatus.status === "open" ? "open" : isOpeningSoon ? "opening-soon" : "closed",
  };
}

function calculateDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface MarketsMapProps {
  markets: Market[];
  selectedMarket?: Market | null;
  onMarketSelect?: (market: Market) => void;
  className?: string;
  boundsKey?: number;
}

export default function MarketsMap({
  markets,
  selectedMarket,
  onMarketSelect,
  className = "",
  boundsKey,
}: MarketsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const lightTilesRef = useRef<TileLayer | null>(null);
  const darkTilesRef = useRef<TileLayer | null>(null);
  const hasUserInteractedRef = useRef<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(true);
  const { t, language } = useLanguage();
  const { theme, systemTheme } = useTheme();

  const formatTime = useCallback(
    (date: Date) =>
      new Intl.DateTimeFormat(language === "ms" ? "ms-MY" : "en-MY", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date),
    [language],
  );

  const nearestAvailableMarket = useMemo(() => {
    if (!userLocation) return null;

    const candidates = markets
      .filter((market) => market.location)
      .map((market) => ({
        market,
        state: getMapStatus(market),
        distance: calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          market.location!.latitude,
          market.location!.longitude,
        ),
      }))
      .filter(({ state }) => state.mapStatus === "open" || state.mapStatus === "opening-soon");

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
      const statusRank = (status: MarketMapStatus) => (status === "open" ? 0 : 1);
      return statusRank(a.state.mapStatus) - statusRank(b.state.mapStatus) || a.distance - b.distance;
    });

    return candidates[0];
  }, [markets, userLocation]);

  const resolveIsDark = useCallback((): boolean => {
    const pref = theme === "system" ? systemTheme : theme;
    if (pref === "dark") return true;
    if (pref === "light") return false;
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, [systemTheme, theme]);

  useEffect(() => {
    const resolved = resolveIsDark();
    // If map already exists, swap tile layers to match the theme
    if (!mapInstanceRef.current || !lightTilesRef.current || !darkTilesRef.current) return;
    try {
      if (resolved) {
        if (lightTilesRef.current) mapInstanceRef.current.removeLayer(lightTilesRef.current);
        darkTilesRef.current.addTo(mapInstanceRef.current);
      } else {
        if (darkTilesRef.current) mapInstanceRef.current.removeLayer(darkTilesRef.current);
        lightTilesRef.current.addTo(mapInstanceRef.current);
      }
    } catch {
      /* ignore */
    }
  }, [isReady, resolveIsDark]);

  // Reset user-interaction flag when parent signals a new bounds fit is wanted
  useEffect(() => {
    if (boundsKey !== undefined) {
      hasUserInteractedRef.current = false;
    }
  }, [boundsKey]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
      );
    }
  }, []);

  // Initialize the map ONCE
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    const init = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Fix for default markers
        delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        if (!mapInstanceRef.current) {
          // Initialize map with center and zoom so subsequent flyTo calls are safe
          const map = L.map(mapRef.current, { zoomControl: false }).setView([3.139, 101.6869], 10);
          // Prepare light and dark tile layers
          lightTilesRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          });
          darkTilesRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          });
          const resolvedDark =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (resolvedDark && darkTilesRef.current) darkTilesRef.current.addTo(map);
          else if (lightTilesRef.current) lightTilesRef.current.addTo(map);
          mapInstanceRef.current = map;
          // Track interaction to preserve viewport
          map.on("zoomstart", () => {
            hasUserInteractedRef.current = true;
          });
          map.on("dragstart", () => {
            hasUserInteractedRef.current = true;
          });
          // Expose the shared helper on window for popup markup (popup HTML calls window.openDirections)
          if (typeof window !== "undefined") {
            window.openDirections = openDirections;
          }
          // ready after first paint
          setTimeout(() => {
            setIsReady(true);
            map.invalidateSize();
            setIsUpdating(false);
          }, 0);

          // Handle resize
          resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
          });
          if (mapRef.current) resizeObserver.observe(mapRef.current);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    init();

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes without recreating the map
  useEffect(() => {
    const updateMarkers = async () => {
      setIsUpdating(true);
      if (!mapInstanceRef.current) {
        // Map not yet initialized — don't leave the UI stuck in updating state
        setIsUpdating(false);
        return;
      }
      const map = mapInstanceRef.current;
      const L = (await import("leaflet")).default;

      // Remove old markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      // User location
      if (userLocation) {
        const userIcon = L.divIcon({
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
          className: "user-location-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup(`<div class="p-2"><p class="text-sm font-medium">${t.yourLocation}</p></div>`);
        markersRef.current.push(userMarker);
      }

      // Market markers
      markets.forEach((market) => {
        if (!market.location) return;
        const isSelected = selectedMarket?.id === market.id;
        const marketState = getMapStatus(market);
        const markerStyle = statusStyles[marketState.mapStatus];
        const markerSize = isSelected ? 34 : marketState.mapStatus === "closed" ? 24 : 28;
        const iconSize = isSelected ? 16 : 13;
        const statusLabel =
          marketState.mapStatus === "open"
            ? t.openNow
            : marketState.mapStatus === "opening-soon"
              ? t.openingSoon
              : t.closedNow;
        const timingText =
          marketState.status === "open" && marketState.closesAt
            ? `${t.closesAt} ${formatTime(marketState.closesAt)}`
            : marketState.nextOpenAt && typeof marketState.minutesUntilNextOpen === "number"
              ? `${t.opensIn} ${formatDuration(marketState.minutesUntilNextOpen)}`
              : t.scheduleNotAvailable;
        const markerIcon = L.divIcon({
          html: `<div style="position:relative;width:${markerSize}px;height:${markerSize}px;">
                   <div style="position:absolute;inset:${isSelected ? "-7px" : "-5px"};border-radius:999px;background:${markerStyle.pulse};"></div>
                   <div style="width:${markerSize}px;height:${markerSize}px;background:${markerStyle.color};border-radius:999px;border:3px solid white;box-shadow:0 10px 24px rgba(15,23,42,.26),0 0 0 6px ${markerStyle.ring};display:flex;align-items:center;justify-content:center;">
                   <svg style="width:${iconSize}px;height:${iconSize}px;color:white;" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                   </svg>
                 </div>`,
          className: "market-marker",
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        });
        const marker = L.marker([market.location.latitude, market.location.longitude], { icon: markerIcon }).addTo(map);
        marker.setZIndexOffset(isSelected ? 900 : markerStyle.zIndex);

        const scheduleText = market.schedule[0]
          ? formatScheduleRule(market.schedule[0], language)
          : t.scheduleNotAvailable;

        marker.bindPopup(`
          <div class="p-3 min-w-64">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="font-semibold text-sm">${escapeHtml(market.name)}</h3>
              <span style="background:${markerStyle.ring};color:${markerStyle.color};border:1px solid ${markerStyle.ring};" class="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">${escapeHtml(statusLabel)}</span>
            </div>
            <p class="text-xs text-gray-600 mb-2">${escapeHtml(market.district)}, ${escapeHtml(market.state)}</p>
            <p class="text-xs font-medium mb-1" style="color:${markerStyle.color};">${escapeHtml(timingText)}</p>
            <p class="text-xs text-gray-500 mb-2">${escapeHtml(scheduleText)}</p>
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
        `);

        // If this market is currently selected, open its popup so the user sees details
        if (isSelected) {
          marker.openPopup();
        }

        marker.on("click", () => {
          if (onMarketSelect) onMarketSelect(market);
        });
        markersRef.current.push(marker);
      });

      // Fit bounds or center on selected market
      const markerCount = markersRef.current.length;
      if (markerCount > 0) {
        const group = L.featureGroup(markersRef.current);
        if (selectedMarket && selectedMarket.location) {
          map.panTo([selectedMarket.location.latitude, selectedMarket.location.longitude], {
            animate: true,
            duration: 0.4,
          });
        } else if (!hasUserInteractedRef.current) {
          map.fitBounds(group.getBounds().pad(0.1));
        }
      }
      setIsUpdating(false);
    };

    updateMarkers();
    // Also re-run when the map is ready so markers are added after initialization
  }, [markets, selectedMarket, userLocation, onMarketSelect, t, language, formatTime, isReady]);

  const centerOnUserLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true, duration: 0.8 });
      } catch {
        /* ignore */
      }
    }
  };

  const fitToMarkers = async () => {
    if (!mapInstanceRef.current || markersRef.current.length === 0) return;
    const L = (await import("leaflet")).default;
    const group = L.featureGroup(markersRef.current);
    try {
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    } catch {
      /* ignore */
    }
  };

  const zoomIn = () => {
    if (!mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.zoomIn();
    } catch {
      /* ignore */
    }
  };

  const zoomOut = () => {
    if (!mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.zoomOut();
    } catch {
      /* ignore */
    }
  };

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
        {nearestAvailableMarket && (
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              const market = nearestAvailableMarket.market;
              if (!market.location || !mapInstanceRef.current) return;
              mapInstanceRef.current.flyTo([market.location.latitude, market.location.longitude], 15, {
                animate: true,
                duration: 0.8,
              });
              if (onMarketSelect) onMarketSelect(market);
            }}
            className="shadow-lg"
            title={t.nearestOpenMarketHint}
            aria-label={t.nearestOpenMarket}
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
        )}
        <Button size="sm" variant="default" onClick={zoomIn} className="shadow-lg" aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="default" onClick={zoomOut} className="shadow-lg" aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="default" onClick={fitToMarkers} className="shadow-lg" aria-label="Fit to markers">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-20 left-4 z-[1001] rounded-md border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur md:bottom-4">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{t.mapLegend}</span>
        </div>
        <div className="grid gap-1 text-muted-foreground">
          {(
            [
              ["open", t.openNow],
              ["opening-soon", t.openingSoon],
              ["closed", t.closedNow],
            ] as const
          ).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-background"
                style={{ backgroundColor: statusStyles[status].color }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
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
  );
}
