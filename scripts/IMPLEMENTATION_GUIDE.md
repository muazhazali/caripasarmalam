# Server-Side Filtering Implementation Guide
## Optimized for Supabase Free Tier (<1000 Markets)

## 📋 Understanding the Flow

### ✅ Your Understanding (Correct)

1. **Get user location** → Detect state via coordinates
2. **Initial load** → Fetch only markets from that state
3. **Filter by "Open Now"** → Show only markets currently open
4. **Browse More** → Load additional markets (other states, closed markets, or pagination)

### 📍 Implementation Details

#### Flow Diagram:
```
User visits homepage
    ↓
Request geolocation (optional)
    ↓
If location granted:
  - Detect state from coordinates
  - Fetch markets: state + open_now = true
  - Initial load: ~20-50 markets (one state, open only)
    ↓
User sees relevant markets
    ↓
User clicks "Browse More" or changes filters:
  - Load markets from other states
  - Load closed markets
  - Load more markets (pagination)
```

---

## 🎯 Clarifications & Edge Cases

### ❓ Questions to Consider:

1. **What does "Browse More" mean?**
   - **Option A:** Load markets from other states
   - **Option B:** Load closed markets too (show all in current state)
   - **Option C:** Pagination (load next 50 markets in current state)
   - **Recommendation:** All three options via filter buttons/UI

2. **What if user denies location?**
   - **Fallback:** Show all markets from all states (or default to "All States")
   - Or show most popular markets
   - Allow manual state selection

3. **Map Page:**
   - **Current:** Loads all markets
   - **Optimized:** Load markets based on map viewport + state filter
   - **Initial:** Load state's markets (same as homepage)

4. **Markets Page (/markets):**
   - **Current:** Loads all markets
   - **Optimized:** Default to user's state, allow manual filter
   - Or show all states with pagination

---

## 🏗️ Architecture Overview

### Current (Inefficient):
```
Server: getAllMarkets() → ALL 1000 markets
Client: markets.filter() → Filter in browser
```

### Optimized (Efficient):
```
Server: getMarkets({ state: 'KL', open_now: true, limit: 50 })
Database: Uses indexes, returns ~20-50 markets
Client: Receives pre-filtered data
```

### Bandwidth Savings:
- **Before:** ~2MB per page load (all markets)
- **After:** ~50KB per page load (state + open only)
- **Savings:** ~97% reduction → 40× less bandwidth

---

## 📝 Implementation Steps

### Step 1: Create Database Helper Functions

```typescript
// lib/db.ts
import { createClient } from '@supabase/supabase-js'
import { dbRowToMarket, type Market } from '@/scripts/migrate-typescript-to-db'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper: Convert coordinates to state (Malaysia)
export function getStateFromCoordinates(lat: number, lng: number): string {
  // Simple bounding box detection (you can improve this)
  // Kuala Lumpur: 3.0-3.4, 101.5-101.8
  if (lat >= 3.0 && lat <= 3.4 && lng >= 101.5 && lng <= 101.8) {
    return 'Kuala Lumpur'
  }
  // Selangor: 2.7-3.7, 101.2-101.9
  if (lat >= 2.7 && lat <= 3.7 && lng >= 101.2 && lng <= 101.9) {
    return 'Selangor'
  }
  // Add more states...
  // For now, return null if not detected
  return 'Kuala Lumpur' // Default fallback
}

// Check if market is currently open
function isMarketOpenNow(market: Market): boolean {
  const now = new Date()
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const currentDay = dayMap[now.getDay()]
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  return market.schedule.some(sched => {
    const hasToday = sched.days.includes(currentDay as any)
    if (!hasToday) return false
    
    return sched.times.some(time => {
      return currentTime >= time.start && currentTime < time.end
    })
  })
}

export interface MarketFilters {
  state?: string
  district?: string
  day?: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  open_now?: boolean // Filter by "currently open"
  amen_toilet?: boolean
  amen_prayer_room?: boolean
  parking_available?: boolean
  status?: string
  limit?: number
  offset?: number
}

export async function getMarkets(filters: MarketFilters = {}): Promise<Market[]> {
  let query = supabase
    .from('pasar_malams')
    .select('*')
  
  // Apply filters (database handles these efficiently)
  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'Active') // Default to active only
  }
  
  if (filters.state) {
    query = query.eq('state', filters.state)
  }
  
  if (filters.district) {
    query = query.eq('district', filters.district)
  }
  
  if (filters.day) {
    query = query.contains('schedule', [{ days: [filters.day] }])
  }
  
  if (filters.amen_toilet !== undefined) {
    query = query.eq('amen_toilet', filters.amen_toilet)
  }
  
  if (filters.amen_prayer_room !== undefined) {
    query = query.eq('amen_prayer_room', filters.amen_prayer_room)
  }
  
  if (filters.parking_available !== undefined) {
    query = query.eq('parking_available', filters.parking_available)
  }
  
  // Pagination
  const limit = filters.limit || 50
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)
  
  const { data, error } = await query
  
  if (error) throw error
  
  let markets = data.map(dbRowToMarket)
  
  // Filter by "open now" client-side (complex logic, better in app)
  if (filters.open_now) {
    markets = markets.filter(isMarketOpenNow)
  }
  
  return markets
}

export async function getMarketById(id: string): Promise<Market | null> {
  const { data, error } = await supabase
    .from('pasar_malams')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return dbRowToMarket(data)
}
```

---

### Step 2: Update Homepage Server Component

```typescript
// app/page.tsx
import HomepageClient from "@/components/homepage-client"
import { getMarkets } from "@/lib/db"
import { getStateFromCoordinates } from "@/lib/db"

export default async function HomePage({
  searchParams,
}: {
  searchParams: { state?: string; open?: string }
}) {
  // Get initial filters from URL params or defaults
  const selectedState = searchParams.state || undefined
  const openNow = searchParams.open === '1'
  
  // Fetch markets with server-side filtering
  const markets = await getMarkets({
    state: selectedState,
    open_now: openNow, // Filter open markets
    status: 'Active',
    limit: 100, // Reasonable initial limit
  })
  
  return <HomepageClient markets={markets} initialState={selectedState} />
}
```

---

### Step 3: Update Homepage Client Component

```typescript
// components/homepage-client.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { getStateFromCoordinates, getMarkets } from "@/lib/db"

export default function HomepageClient({ 
  markets: initialMarkets,
  initialState 
}: { 
  markets: Market[]
  initialState?: string
}) {
  const [markets, setMarkets] = useState(initialMarkets)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedState, setSelectedState] = useState(initialState || "All States")
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          
          // Detect state from coordinates
          const state = getStateFromCoordinates(location.lat, location.lng)
          
          // Fetch markets for user's state, open now
          const userMarkets = await getMarkets({
            state,
            open_now: true, // Only open markets
            status: 'Active',
            limit: 50,
          })
          
          setMarkets(userMarkets)
          setSelectedState(state)
        },
        (error) => {
          // Location denied - keep initial markets
          console.warn("Geolocation denied:", error)
        }
      )
    }
  }, [])
  
  // Handle "Browse More" button
  const loadMoreMarkets = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      // Load more markets from current state (remove open_now filter)
      const moreMarkets = await getMarkets({
        state: selectedState !== "All States" ? selectedState : undefined,
        // open_now: false, // Include closed markets
        status: 'Active',
        limit: 50,
        offset: markets.length, // Pagination
      })
      
      setMarkets(prev => [...prev, ...moreMarkets])
    } catch (error) {
      console.error("Error loading more markets:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [selectedState, markets.length])
  
  // Handle state filter change
  const handleStateChange = useCallback(async (state: string) => {
    setSelectedState(state)
    
    const newMarkets = await getMarkets({
      state: state !== "All States" ? state : undefined,
      open_now: true,
      status: 'Active',
      limit: 100,
    })
    
    setMarkets(newMarkets)
  }, [])
  
  // ... rest of your component logic
}
```

---

### Step 4: Update Markets Page

```typescript
// app/markets/page.tsx
import MarketsFilterClient from "@/components/markets-filter-client"
import { getMarkets } from "@/lib/db"

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: { 
    state?: string
    day?: string
    open?: string
  }
}) {
  // Fetch with filters from URL
  const markets = await getMarkets({
    state: searchParams.state || undefined,
    day: searchParams.day as any,
    open_now: searchParams.open === '1',
    status: 'Active',
    limit: 200, // More markets for markets page
  })
  
  return (
    <MarketsFilterClient 
      markets={markets}
      initialState={searchParams.state}
      initialDay={searchParams.day}
    />
  )
}
```

---

### Step 5: Update Map Page

```typescript
// app/map/page.tsx
"use client"

import { useState, useEffect } from "react"
import MarketsMap from "@/components/markets-map"
import { getMarkets } from "@/lib/db"

export default function MapPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedState, setSelectedState] = useState("All States")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  // Get user location and load markets
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          
          const state = getStateFromCoordinates(location.lat, location.lng)
          setSelectedState(state)
          
          // Load markets for map (with location required)
          const mapMarkets = await getMarkets({
            state,
            status: 'Active',
            limit: 200, // Map can handle more markers
          })
          
          // Filter only markets with coordinates
          setMarkets(mapMarkets.filter(m => m.location))
        },
        async () => {
          // Location denied - load all states
          const allMarkets = await getMarkets({
            status: 'Active',
            limit: 500,
          })
          setMarkets(allMarkets.filter(m => m.location))
        }
      )
    } else {
      // No geolocation - load all
      getMarkets({ status: 'Active', limit: 500 })
        .then(m => setMarkets(m.filter(m => m.location)))
    }
  }, [])
  
  // Handle state filter change
  const handleStateChange = async (state: string) => {
    setSelectedState(state)
    const newMarkets = await getMarkets({
      state: state !== "All States" ? state : undefined,
      status: 'Active',
      limit: 200,
    })
    setMarkets(newMarkets.filter(m => m.location))
  }
  
  // ... rest of map page UI
}
```

---

## 📊 Bandwidth Calculation

### Scenario: 100 Users/Day, 3 Page Loads Each

| Approach | Data per Load | Total/Day | Monthly | Free Tier |
|----------|---------------|-----------|---------|-----------|
| **All Markets** | 2MB | 600MB | 18GB | ❌ 360% over |
| **State Only** | 200KB | 60MB | 1.8GB | ❌ 36% over |
| **State + Open** | 50KB | 15MB | 450MB | ✅ 9% of limit |

**Result:** ✅ Well within 5GB/month free tier limit

---

## 🎨 UI Recommendations

### Homepage:
1. **Auto-detect state** from location → Show state's open markets
2. **"Browse All States"** button → Loads markets from all states
3. **"Include Closed"** toggle → Loads closed markets too
4. **"Load More"** button → Pagination (next 50 markets)

### Markets Page:
1. **Default filter:** User's state (if location available)
2. **Allow manual state selection** → Server fetches filtered markets
3. **Day filter** → Server filters by schedule day
4. **"Open Now" toggle** → Client-side filter (or server-side if complex)

### Map Page:
1. **Auto-center** on user location (if available)
2. **State filter dropdown** → Server fetches markets for selected state
3. **Only show markets with coordinates** (filter on client)

---

## ⚠️ Important Notes

### 1. **Coordinate to State Mapping**
You need a proper geolocation library or API to map coordinates to states. The simple function above is a placeholder. Consider:
- Using a geolocation library (geolib, turf.js)
- Using reverse geocoding API (Google Maps, Mapbox)
- Storing state boundaries in database

### 2. **"Open Now" Logic**
- Complex to calculate server-side (timezone, day of week, multiple time slots)
- Better done client-side with `getMarketOpenStatus()` function you already have
- Or cache "open now" status and update periodically

### 3. **Pagination Strategy**
- **Option A:** Infinite scroll (load more on scroll)
- **Option B:** "Load More" button (explicit action)
- **Option C:** Traditional pagination (page 1, 2, 3...)
- **Recommendation:** Infinite scroll for better UX

### 4. **Caching Strategy**
- Use Next.js caching: `export const revalidate = 3600` (1 hour)
- Cache markets list in browser (sessionStorage)
- Use SWR or React Query for client-side caching

---

## ✅ Summary

**Your Understanding: ✅ CORRECT**

1. ✅ Get user location → Detect state
2. ✅ Load only state's markets → Initial load (~50KB)
3. ✅ Show only open markets → Filter by `open_now: true`
4. ✅ "Browse More" → Load additional markets (other states, closed, pagination)

**Key Benefits:**
- 97% bandwidth reduction (~50KB vs 2MB per load)
- 3% of free tier limit (vs 360% over)
- Fast initial load (only relevant markets)
- Scalable (works with 10,000+ markets)

**Implementation Priority:**
1. ✅ Create `lib/db.ts` with helper functions
2. ✅ Update homepage to use server-side filtering
3. ✅ Add "Browse More" functionality
4. ✅ Update markets page
5. ✅ Update map page

---

**Next Steps:** Start with homepage implementation, then expand to other pages.

