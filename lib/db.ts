/**
 * Database helper functions for markets
 * Provides server-side query functions with filtering
 */

import { createClient } from './supabase'
import { dbRowToMarket } from '@/scripts/migrate-typescript-to-db'
import type { Market, Weekday } from './markets-data'
import { getMarketOpenStatus } from './utils'

/**
 * Filter options for querying markets
 */
export interface MarketFilters {
  state?: string
  district?: string
  day?: Weekday
  status?: string
  amen_toilet?: boolean
  amen_prayer_room?: boolean
  parking_available?: boolean
  parking_accessible?: boolean
  limit?: number
  offset?: number
  // Note: open_now filtering is done client-side due to complex timezone logic
}

/**
 * Main function to fetch markets with optional filters
 * Performs server-side filtering for efficient queries
 * 
 * @param filters - Filter options
 * @returns Array of Market objects matching the filters
 */
export async function getMarkets(filters: MarketFilters = {}): Promise<Market[]> {
  const supabase = await createClient()
  let query = supabase.from('pasar_malams').select('*')

  // Apply server-side filters
  if (filters.state) {
    query = query.eq('state', filters.state)
  }

  if (filters.district) {
    query = query.eq('district', filters.district)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    // Default to Active markets only
    query = query.eq('status', 'Active')
  }

  // Amenities filters
  if (filters.amen_toilet !== undefined) {
    query = query.eq('amen_toilet', filters.amen_toilet)
  }

  if (filters.amen_prayer_room !== undefined) {
    query = query.eq('amen_prayer_room', filters.amen_prayer_room)
  }

  // Parking filters
  if (filters.parking_available !== undefined) {
    query = query.eq('parking_available', filters.parking_available)
  }

  if (filters.parking_accessible !== undefined) {
    query = query.eq('parking_accessible', filters.parking_accessible)
  }

  // Day filter - check if schedule JSONB contains the day
  // This uses the GIN index on schedule
  // The schedule structure is: [{"days": ["mon", "tue"], "times": [...]}]
  // We check if any element has the specified day in its days array
  if (filters.day) {
    // Use contains operator to check if schedule array contains an object with the day
    // This will match if any schedule entry has the day in its days array
    query = query.contains('schedule', [{ days: [filters.day] }])
  }

  // Pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching markets:', error)
    throw new Error(`Failed to fetch markets: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // Transform database rows to Market objects
  return data.map(dbRowToMarket)
}

/**
 * Fetch a single market by ID
 * 
 * @param id - Market ID
 * @returns Market object or null if not found
 */
export async function getMarketById(id: string): Promise<Market | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pasar_malams')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    console.error('Error fetching market:', error)
    throw new Error(`Failed to fetch market: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return dbRowToMarket(data)
}

/**
 * Check if a market is currently open
 * This is a client-side function due to complex timezone logic
 * Uses Malaysia timezone (UTC+8)
 * 
 * @param market - Market object to check
 * @param now - Optional Date object (defaults to current time)
 * @returns true if market is open now, false otherwise
 */
export function isMarketOpenNow(market: Market, now?: Date): boolean {
  const status = getMarketOpenStatus(market, now)
  return status.status === 'open'
}

/**
 * Get all distinct states from the database
 * Useful for populating state filter dropdowns
 * 
 * @returns Array of unique state names
 */
export async function getAllStates(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pasar_malams')
    .select('state')
    .eq('status', 'Active')

  if (error) {
    console.error('Error fetching states:', error)
    return []
  }

  if (!data) {
    return []
  }

  // Get unique states and sort them
  const uniqueStates = Array.from(new Set(data.map((row) => row.state)))
  return uniqueStates.sort()
}

/**
 * Get all distinct districts for a given state
 * 
 * @param state - State name
 * @returns Array of unique district names
 */
export async function getDistrictsByState(state: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pasar_malams')
    .select('district')
    .eq('state', state)
    .eq('status', 'Active')

  if (error) {
    console.error('Error fetching districts:', error)
    return []
  }

  if (!data) {
    return []
  }

  // Get unique districts and sort them
  const uniqueDistricts = Array.from(new Set(data.map((row) => row.district)))
  return uniqueDistricts.sort()
}

