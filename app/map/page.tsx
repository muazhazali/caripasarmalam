"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketsMap from "@/components/markets-map";
import { type Market } from "@/lib/markets-data";
import { useLanguage } from "@/components/language-provider";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { getStateFromCoordinates, requestUserLocation } from "@/lib/geolocation";
import { dbRowToMarket } from "@/lib/db-transform";
import { getMarketOpenStatus } from "@/lib/utils";

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

// States without "Semua Negeri" for the picker modal
const STATE_LIST = malaysianStates.slice(1);
const OPENING_SOON_MINUTES = 120;
const OPEN_NEARBY_RADIUS_KM = 20;

type MapStatusFilter = "all" | "open" | "opening-soon";

function getMapFilterStatus(market: Market): MapStatusFilter | "closed" {
  const status = getMarketOpenStatus(market);
  if (status.status === "open") return "open";
  if (typeof status.minutesUntilNextOpen === "number" && status.minutesUntilNextOpen <= OPENING_SOON_MINUTES) {
    return "opening-soon";
  }
  return "closed";
}

export default function MapPage() {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("Semua Negeri");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [statusFilter, setStatusFilter] = useState<MapStatusFilter>("all");
  const [boundsKey, setBoundsKey] = useState(0);
  // Modal: show until user picks a state or grants location
  const [showStatePicker, setShowStatePicker] = useState(true);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

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

  // Get user location on mount — silently, don't block modal
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
            setShowStatePicker(false);
            fetchMarkets(state);
          } else {
            // Location outside Malaysia — keep modal open
            setIsLoadingMarkets(false);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocationDenied(true);
          setIsLoadingMarkets(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    } else {
      queueMicrotask(() => {
        setLocationDenied(true);
        setIsLoadingMarkets(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Pick state from modal
  const handleModalStateSelect = useCallback(
    (state: string) => {
      setSelectedState(state);
      setShowStatePicker(false);
      setBoundsKey((k) => k + 1);
      fetchMarkets(state);
    },
    [fetchMarkets],
  );

  // Request location from modal
  const handleModalLocationRequest = useCallback(async () => {
    setIsRequestingLocation(true);
    try {
      const { lat, lng } = await requestUserLocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      setUserLocation({ lat, lng });
      setLocationDenied(false);
      const state = getStateFromCoordinates(lat, lng);
      if (state) {
        setSelectedState(state);
        setShowStatePicker(false);
        fetchMarkets(state);
      } else {
        fetchMarkets();
        setShowStatePicker(false);
      }
    } catch (err) {
      console.warn("Geolocation request failed:", err);
      setLocationDenied(true);
    } finally {
      setIsRequestingLocation(false);
    }
  }, [fetchMarkets]);

  // Filter markets client-side (search, state, and coordinates only)
  const filteredMarkets = useMemo(
    () =>
      markets.filter((market) => {
        const matchesSearch =
          searchQuery === "" ||
          market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          market.state.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesState =
          selectedState === "Semua Negeri" || selectedState === "All States" || market.state === selectedState;

        // Only show markets with coordinates
        return matchesSearch && matchesState && market.location;
      }),
    [markets, searchQuery, selectedState],
  );

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

  const displayedMarkets = useMemo(() => {
    if (statusFilter === "all") return sortedMarkets;
    return sortedMarkets.filter((market) => getMapFilterStatus(market) === statusFilter);
  }, [sortedMarkets, statusFilter]);

  const openNearbyCount = useMemo(() => {
    const openMarkets = filteredMarkets.filter((market) => getMapFilterStatus(market) === "open");
    if (!userLocation) return openMarkets.length;

    return openMarkets.filter((market) => {
      if (!market.location) return false;
      return (
        getDistanceKm(userLocation.lat, userLocation.lng, market.location.latitude, market.location.longitude) <=
        OPEN_NEARBY_RADIUS_KM
      );
    }).length;
  }, [filteredMarkets, userLocation]);

  const reRequestLocation = useCallback(async () => {
    try {
      const { lat, lng } = await requestUserLocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      setUserLocation({ lat, lng });
      setLocationDenied(false);
      const state = getStateFromCoordinates(lat, lng);
      if (state) {
        setSelectedState(state);
        setShowStatePicker(false);
        fetchMarkets(state);
      } else {
        fetchMarkets();
        setShowStatePicker(false);
      }
    } catch (err) {
      console.warn("Geolocation request failed:", err);
      setLocationDenied(true);
    }
  }, [fetchMarkets]);

  return (
    <div className="min-h-screen bg-background">
      {/* State Picker Modal */}
      {showStatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-foreground">{t.selectStatePromptTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.selectStatePromptDescription}</p>
            </div>

            {/* Location button */}
            <Button className="w-full gap-2" onClick={handleModalLocationRequest} disabled={isRequestingLocation}>
              {isRequestingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {isRequestingLocation ? t.searching : t.enableLocationButton}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">atau pilih negeri</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* State grid */}
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {STATE_LIST.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => handleModalStateSelect(state)}
                  className="rounded-lg border border-border bg-muted/40 px-2 py-2.5 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors text-center leading-tight"
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {(
                [
                  ["all", t.allMarkets],
                  ["open", t.openNow],
                  ["opening-soon", t.openingSoon],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={statusFilter === value ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter(value);
                    setSelectedMarket(null);
                    setBoundsKey((key) => key + 1);
                  }}
                  className="shrink-0"
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              <span>
                {openNearbyCount} {userLocation ? t.openNearby : t.openNow}
              </span>
            </div>
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
          userLocation={userLocation}
          className="h-full"
          boundsKey={boundsKey}
        />
      </div>
    </div>
  );
}
