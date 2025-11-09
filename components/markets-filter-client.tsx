'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Car,
  Toilet as Restroom,
  Home as Mosque,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Map,
  Navigation2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMarketOpenStatus } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Market } from '@/lib/markets-data';
import openDirections from '@/lib/directions';
import { useLanguage } from '@/components/language-provider';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';
import { dbRowToMarket } from '@/lib/db-transform';
import MarketCard from '@/components/market-card';

const malaysianStates = [
  'Semua Negeri',
  'Johor',
  'Kedah',
  'Kelantan',
  'Kuala Lumpur',
  'Labuan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Pulau Pinang',
  'Perak',
  'Perlis',
  'Putrajaya',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu'
];

const daysOfWeek = [
  'Semua Hari',
  'Isnin',
  'Selasa',
  'Rabu',
  'Khamis',
  'Jumaat',
  'Sabtu',
  'Ahad'
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

interface MarketsFilterClientProps {
  initialMarkets: Market[];
  initialState?: string;
}

// Map localized day names to day codes
const dayMap: Record<string, string> = {
  Isnin: 'mon',
  Selasa: 'tue',
  Rabu: 'wed',
  Khamis: 'thu',
  Jumaat: 'fri',
  Sabtu: 'sat',
  Ahad: 'sun'
};

export default function MarketsFilterClient({
  initialMarkets,
  initialState
}: MarketsFilterClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);

  // Generate ItemList structured data for the markets directory
  const itemListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Malaysia Night Markets Directory',
    description:
      'Complete directory of night markets across Malaysia with operating hours, amenities, and locations',
    numberOfItems: markets.length,
    itemListElement: markets.map((market, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        '@id': `${
          process.env.NEXT_PUBLIC_SITE_URL || 'https://pasarmalam.app'
        }/markets/${market.id}`,
        name: market.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: market.address,
          addressLocality: market.district,
          addressRegion: market.state,
          addressCountry: 'MY'
        },
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || 'https://pasarmalam.app'
        }/markets/${market.id}`,
        geo: market.location
          ? {
              '@type': 'GeoCoordinates',
              latitude: market.location.latitude,
              longitude: market.location.longitude
            }
          : undefined,
        openingHoursSpecification: market.schedule.map((schedule) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: schedule.days.map((day) => {
            const dayMap: { [key: string]: string } = {
              mon: 'Monday',
              tue: 'Tuesday',
              wed: 'Wednesday',
              thu: 'Thursday',
              fri: 'Friday',
              sat: 'Saturday',
              sun: 'Sunday'
            };
            return dayMap[day];
          }),
          opens: schedule.times[0]?.start,
          closes: schedule.times[schedule.times.length - 1]?.end
        }))
      }
    }))
  }
  const [searchQuery, setSearchQuery] = useState("")
  // Default to "Semua Negeri" (first item in array) instead of "All States"
  const stateFromUrl = searchParams.get("state")
  // Normalize "All States" to "Semua Negeri" for consistency
  const normalizedState = stateFromUrl === "All States" ? malaysianStates[0] : stateFromUrl
  const defaultState = normalizedState || initialState || malaysianStates[0] // "Semua Negeri"
  const [selectedState, setSelectedState] = useState(defaultState)
  // Default to "Semua Hari" (first item in array) instead of "All Days"
  const dayFromUrl = searchParams.get("day")
  // Normalize "All Days" to "Semua Hari" for consistency
  const normalizedDay = dayFromUrl === "All Days" ? daysOfWeek[0] : dayFromUrl
  const defaultDay = normalizedDay || daysOfWeek[0] // "Semua Hari"
  const [selectedDay, setSelectedDay] = useState(defaultDay)
  // Default to distance; if location unavailable, sorter falls back to name
  const [sortBy, setSortBy] = useState('distance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [openNow, setOpenNow] = useState<boolean>(
    searchParams.get('open') === '1'
  );
  const [filters, setFilters] = useState({
    parking: false,
    toilet: false,
    prayer_room: false,
    accessible_parking: false
  });
  const [showFilters, setShowFilters] = useState(false);
  // Pagination
  const [visibleCount, setVisibleCount] = useState(24)
  const PAGE_SIZE = 24


  // Attempt to get user location on first load to enable nearest sorting by default
  useEffect(() => {
    if (
      !userLocation &&
      typeof window !== 'undefined' &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setSortBy('distance');
        },
        () => {
          // keep default behavior (falls back to name when distance w/o location)
        },
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
      );
    }
  }, []);

  // Fetch markets using browser client
  const fetchMarkets = useCallback(async (state?: string, day?: string) => {
    setIsLoadingMarkets(true);
    try {
      const supabase = createBrowserSupabaseClient();
      let query = supabase
        .from('pasar_malams')
        .select('*')
        .eq('status', 'Active');

      if (state && state !== 'All States' && state !== 'Semua Negeri') {
        query = query.eq('state', state);
      }

      const dayCode = day && dayMap[day] ? dayMap[day] : undefined;
      if (dayCode) {
        // Use filter with 'cs' (contains) operator for JSONB to avoid serialization issues
        const dayFilterValue = `[{"days":["${dayCode}"]}]`
        query = query.filter('schedule', 'cs', dayFilterValue)
      }

      // Reduce server load by limiting result set; UI paginates on client
      query = query.limit(150);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching markets:', error);
        return;
      }

      if (data) {
        // Transform database rows to Market objects
        const transformedMarkets = data.map(dbRowToMarket);
        setMarkets(transformedMarkets);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setIsLoadingMarkets(false);
    }
  }, []);

  const setQueryParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === "All States" || value === "Semua Negeri" || value === "All Days" || value === "Semua Hari") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`?${params.toString()}`)
    
    // Update local state - use first item from arrays as default
    if (key === "state") {
      setSelectedState(value || malaysianStates[0]) // "Semua Negeri"
    }
    if (key === "day") {
      setSelectedDay(value || daysOfWeek[0]) // "Semua Hari"
    }
    
    // Fetch markets when state/day changes
    const newState = key === "state" ? (value || undefined) : selectedState
    const newDay = key === "day" ? (value || undefined) : selectedDay
    
    fetchMarkets(
      newState && newState !== "All States" && newState !== "Semua Negeri" ? newState : undefined,
      newDay && newDay !== "All Days" && newDay !== "Semua Hari" ? newDay : undefined
    )
  }, [searchParams, router, selectedState, selectedDay, fetchMarkets])

  const findNearestMarkets = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setSortBy('distance');
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert(
            'Unable to get your location. Please enable location services.'
          );
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const filteredAndSortedMarkets = useMemo(() => {
    const filtered = markets.filter((market) => {
      const matchesSearch =
        searchQuery === '' ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = selectedState === "All States" || selectedState === "Semua Negeri" || market.state === selectedState

      const matchesDay =
        selectedDay === 'All Days' ||
        selectedDay === 'Semua Hari' ||
        market.schedule.some((schedule) =>
          schedule.days.some((day) => {
            return dayMap[selectedDay] === day;
          })
        );

      const matchesFilters =
        (!filters.parking || market.parking.available) &&
        (!filters.toilet || market.amenities.toilet) &&
        (!filters.prayer_room || market.amenities.prayer_room) &&
        (!filters.accessible_parking || market.parking.accessible);

      const matchesOpen =
        !openNow || getMarketOpenStatus(market).status === 'open';

      return (
        matchesSearch &&
        matchesState &&
        matchesDay &&
        matchesFilters &&
        matchesOpen
      );
    });

    // Sort markets by selected sort option and order
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'state':
          comparison =
            a.state.localeCompare(b.state) ||
            a.district.localeCompare(b.district);
          break;
        case 'size':
          comparison = (a.total_shop || 0) - (b.total_shop || 0);
          break;
        case 'area':
          comparison = (a.area_m2 || 0) - (b.area_m2 || 0);
          break;
        case 'distance':
          if (!userLocation) {
            comparison = a.name.localeCompare(b.name);
          } else {
            const distanceA = a.location
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  a.location.latitude,
                  a.location.longitude
                )
              : Number.POSITIVE_INFINITY;
            const distanceB = b.location
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  b.location.latitude,
                  b.location.longitude
                )
              : Number.POSITIVE_INFINITY;
            comparison = distanceA - distanceB;
          }
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    searchQuery,
    selectedState,
    selectedDay,
    sortBy,
    sortOrder,
    filters,
    userLocation,
    openNow,
    markets
  ]);

  // Reset visible results when filters or sorting change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    searchQuery,
    selectedState,
    selectedDay,
    sortBy,
    sortOrder,
    filters,
    userLocation,
    openNow
  ]);

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedState(malaysianStates[0]) // "Semua Negeri"
    setSelectedDay(daysOfWeek[0]) // "Semua Hari"
    setOpenNow(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("filterOpenNow", "true")
    }
    setFilters({
      parking: false,
      toilet: false,
      prayer_room: false,
      accessible_parking: false
    });
  };

  const formatArea = (areaM2: number) => {
    if (areaM2 >= 10000) {
      return `${(areaM2 / 1000000).toFixed(2)} ${t.kmSquared}`;
    }
    return `${Math.round(areaM2)} m²`;
  };

  function isPositiveNumber(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    const n = typeof value === 'string' ? Number(value) : (value as number);
    if (Number.isNaN(n)) return false;
    return n > 0;
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListData)
        }}
      />

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
              <Select value={selectedState} onValueChange={(value) => setQueryParam("state", value)}>
                <SelectTrigger className="w-48 h-11 md:h-12">
                  <SelectValue placeholder={t.stateLabel} />
                </SelectTrigger>
                <SelectContent>
                  {malaysianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state === "All States" || state === "Semua Negeri" ? t.allStates : state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDay} onValueChange={(value) => setQueryParam("day", value)}>
                <SelectTrigger className="w-40 h-11 md:h-12">
                  <SelectValue placeholder={t.dayLabel} />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day === "All Days" || day === "Semua Hari" ? t.allDays : t[day.toLowerCase() as keyof typeof t] || day}
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
                  <CardTitle className="text-lg">
                    {t.filtersAmenities}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                    >
                      {t.clearAllFilters}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="open-now"
                      checked={openNow}
                      onCheckedChange={(checked: boolean) => {
                        const next = !!checked;
                        setOpenNow(next);
                        setQueryParam('open', next ? '1' : null);
                      }}
                      className="size-5 border-2 shadow-sm hover:border-foreground data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="open-now"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t.openNow}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parking"
                      checked={filters.parking}
                      onCheckedChange={(checked: boolean) =>
                        setFilters((prev) => ({ ...prev, parking: !!checked }))
                      }
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
                      onCheckedChange={(checked: boolean) =>
                        setFilters((prev) => ({
                          ...prev,
                          accessible_parking: !!checked
                        }))
                      }
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
                      onCheckedChange={(checked: boolean) =>
                        setFilters((prev) => ({ ...prev, toilet: !!checked }))
                      }
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
                      onCheckedChange={(checked: boolean) =>
                        setFilters((prev) => ({
                          ...prev,
                          prayer_room: !!checked
                        }))
                      }
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
                  {t.showingResults} {Math.min(visibleCount, filteredAndSortedMarkets.length)} {t.of} {filteredAndSortedMarkets.length} {t.markets}
                </p>
              </div>
              {/* Mobile filter button */}
              <div className="flex items-center gap-2">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button className="md:hidden rounded-full h-10 w-10 p-0 shadow-lg">
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
                        <Select value={selectedState} onValueChange={(value) => setQueryParam("state", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {malaysianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state === "All States" || state === "Semua Negeri" ? t.allStates : state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">{t.dayLabel}</label>
                        <Select value={selectedDay} onValueChange={(value) => setQueryParam("day", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day === "All Days" || day === "Semua Hari" ? t.allDays : t[day.toLowerCase() as keyof typeof t] || day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="open-now-mobile"
                            checked={openNow}
                            onCheckedChange={(checked: boolean) => {
                              const next = !!checked;
                              setOpenNow(next);
                              setQueryParam('open', next ? '1' : null);
                            }}
                          />
                          <label htmlFor="open-now-mobile" className="text-sm font-medium">
                            {t.openNow}
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="parking"
                            checked={filters.parking}
                            onCheckedChange={(checked: boolean) =>
                              setFilters((prev) => ({ ...prev, parking: checked as boolean }))
                            }
                          />
                          <label htmlFor="parking" className="text-sm font-medium">
                            {t.parking}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="toilet"
                            checked={filters.toilet}
                            onCheckedChange={(checked: boolean) =>
                              setFilters((prev) => ({ ...prev, toilet: checked as boolean }))
                            }
                          />
                          <label htmlFor="toilet" className="text-sm font-medium">
                            {t.toilet}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="prayer_room"
                            checked={filters.prayer_room}
                            onCheckedChange={(checked: boolean) =>
                              setFilters((prev) => ({ ...prev, prayer_room: checked as boolean }))
                            }
                          />
                          <label htmlFor="prayer_room" className="text-sm font-medium">
                            {t.prayerRoom}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="accessible_parking"
                            checked={filters.accessible_parking}
                            onCheckedChange={(checked: boolean) =>
                              setFilters((prev) => ({ ...prev, accessible_parking: checked as boolean }))
                            }
                          />
                          <label htmlFor="accessible_parking" className="text-sm font-medium">
                            {t.accessibleParking}
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                          {t.clearAllFilters}
                        </Button>
                        <Button onClick={() => setShowFilters(false)} className="flex-1">
                          {t.applyFilters}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
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
                    <SelectItem value="distance">{t.sortByDistance}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

              {/* Mobile controls */}
              <div className="mt-3 grid grid-cols-1 gap-2 md:hidden">
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1 h-11 text-base">
                      <ArrowUpDown className="h-5 w-5 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">{t.sortByName}</SelectItem>
                      <SelectItem value="state">{t.sortByLocation}</SelectItem>
                      <SelectItem value="size">{t.sortByStallCount}</SelectItem>
                      <SelectItem value="area">{t.sortByAreaSize}</SelectItem>
                      <SelectItem value="distance">
                        {t.sortByDistance}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className="px-3 h-11"
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-5 w-5" />
                    ) : (
                      <ArrowDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoadingMarkets ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading markets...</p>
            </div>
          ) : filteredAndSortedMarkets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                {t.noMarketsFound}
              </p>
              <p className="text-muted-foreground mb-4">
                {t.tryAdjustingFilters}
              </p>
              <Button onClick={clearAllFilters}>{t.clearAllFilters}</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedMarkets
                  .slice(0, visibleCount)
                  .map((market) => (
                    <MarketCard
                      key={market.id}
                      market={market}
                      userLocation={userLocation}
                      showAddress={true}
                    />
                  ))}
              </div>
              {filteredAndSortedMarkets.length > visibleCount && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    variant="outline"
                  >
                    {t.showMore}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
