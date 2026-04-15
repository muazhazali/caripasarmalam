"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, List, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketsMap from "@/components/markets-map";
import { type Market } from "@/lib/markets-data";
import { useLanguage } from "@/components/language-provider";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { getStateFromCoordinates, requestUserLocation } from "@/lib/geolocation";
import { dbRowToMarket } from "@/lib/db-transform";

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
];

export default function MapPage() {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("Semua Negeri");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [boundsKey, setBoundsKey] = useState(0);

  // Fetch markets from server
  const fetchMarkets = useCallback(async (state?: string, limitOverride?: number) => {
    setIsLoadingMarkets(true);
    try {
      const supabase = createBrowserSupabaseClient();
      let query = supabase.from("pasar_malams").select("*").eq("status", "Active");

      if (state && state !== "Semua Negeri" && state !== "All States") {
        query = query.eq("state", state);
      }

      const limit =
        typeof limitOverride === "number"
          ? limitOverride
          : state && state !== "Semua Negeri" && state !== "All States"
            ? 1000
            : 1000;
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching markets:", error);
        return;
      }

      if (data) {
        // Transform database rows to Market objects
        const transformedMarkets = data.map(dbRowToMarket);
        setMarkets(transformedMarkets);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setIsLoadingMarkets(false);
    }
  }, []);

  // Handle state change - fetch from server
  const handleStateChange = useCallback(
    (newState: string) => {
      // Normalize "All States" to "Semua Negeri" for consistency
      const normalizedState = newState === "All States" ? malaysianStates[0] : newState;
      setSelectedState(normalizedState);
      setBoundsKey((k) => k + 1);
      fetchMarkets(
        normalizedState !== "Semua Negeri" && normalizedState !== "All States" ? normalizedState : undefined,
      );
    },
    [fetchMarkets],
  );

  // Get user location on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationDenied(false);

          // Detect state and auto-filter
          const state = getStateFromCoordinates(lat, lng);
          if (state) {
            setSelectedState(state);
            fetchMarkets(state);
          } else {
            // Location outside Malaysia — don't fetch, show prompt
            setIsLoadingMarkets(false);
          }
        },
        (error) => {
          // Permission denied or unavailable — show empty map + select state prompt
          console.warn("Geolocation error:", error);
          setLocationDenied(true);
          setIsLoadingMarkets(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    } else {
      // Geolocation not available — show empty map + select state prompt
      setLocationDenied(true);
      setIsLoadingMarkets(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Filter markets client-side (search, state, and coordinates only)
  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      searchQuery === "" ||
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState =
      selectedState === "Semua Negeri" || selectedState === "All States" || market.state === selectedState;

    // Only show markets with coordinates
    return matchesSearch && matchesState && market.location;
  });

  // Distance calculation
  function getDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Sort by distance when userLocation is available
  const sortedMarkets = useMemo(() => {
    if (!userLocation) return filteredMarkets;
    const withDistance = filteredMarkets.map((m) => ({
      market: m,
      distance: m.location
        ? getDistanceKm(userLocation.lat, userLocation.lng, m.location.latitude, m.location.longitude)
        : Infinity,
    }));
    withDistance.sort((a, b) => a.distance - b.distance);
    return withDistance.map((x) => x.market);
  }, [filteredMarkets, userLocation]);

  const displayedMarkets = useMemo(() => sortedMarkets, [sortedMarkets]);

  const reRequestLocation = useCallback(async () => {
    try {
      const { lat, lng } = await requestUserLocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      setUserLocation({ lat, lng });
      setLocationDenied(false);
      const state = getStateFromCoordinates(lat, lng);
      if (state) {
        setSelectedState(state);
        fetchMarkets(state);
      } else {
        fetchMarkets();
      }
    } catch (err) {
      console.warn("Geolocation request failed:", err);
      setLocationDenied(true);
      // Helpful guidance when permission is blocked/denied
      if (typeof window !== "undefined") {
        alert(
          "Location access is blocked or denied. Please enable location for this site in your browser settings and try again.",
        );
      }
    }
  }, [fetchMarkets]);

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
                <SelectValue>
                  {selectedState === "All States" || selectedState === "Semua Negeri" ? t.allStates : selectedState}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50">
                {malaysianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state === "All States" || state === "Semua Negeri" ? t.allStates : state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {locationDenied && (
            <div className="mt-3 flex flex-col md:flex-row items-start md:items-center gap-3 rounded-md border bg-muted/50 p-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{t.enableLocationTitle}</div>
                <div className="text-xs text-muted-foreground">{t.enableLocationDescription}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={reRequestLocation}>
                  {t.enableLocationButton}
                </Button>
                {/* The state selector above serves as the choose state action */}
              </div>
            </div>
          )}
          {/* Empty state prompt — no state selected and no markets */}
          {!isLoadingMarkets &&
            markets.length === 0 &&
            (selectedState === "Semua Negeri" || selectedState === "All States") && (
              <div className="mt-3 rounded-md border bg-muted/50 px-4 py-3 flex items-center gap-3">
                <span className="text-xl">🗺️</span>
                <div>
                  <p className="text-sm font-medium">{t.selectStatePromptTitle}</p>
                  <p className="text-xs text-muted-foreground">{t.selectStatePromptDescription}</p>
                </div>
              </div>
            )}

          <div className="mt-2 text-sm text-muted-foreground">
            {isLoadingMarkets ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading markets...
              </span>
            ) : (selectedState === "Semua Negeri" || selectedState === "All States") && markets.length === 0 ? null : (
              <span>
                {t.showingResults} {displayedMarkets.length} {t.markets}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-180px)] relative z-0">
        <MarketsMap
          markets={displayedMarkets}
          selectedMarket={selectedMarket}
          onMarketSelect={setSelectedMarket}
          className="h-full"
          boundsKey={boundsKey}
        />
      </div>
    </div>
  );
}
