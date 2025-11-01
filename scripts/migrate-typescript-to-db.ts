/**
 * Migration script to convert TypeScript markets-data.ts to Supabase database
 * 
 * Usage:
 * 1. Import your markets data
 * 2. Transform to database format
 * 3. Insert into Supabase
 * 
 * This script helps migrate from your existing TypeScript Market[] array
 * to the JSONB-based PostgreSQL schema.
 */

import type { Market } from '@/lib/markets-data'

/**
 * Transform a Market object to database row format
 * Converts nested objects to appropriate columns/JSONB
 */
export function marketToDbRow(market: Market) {
  return {
    id: market.id,
    name: market.name,
    address: market.address,
    district: market.district,
    state: market.state,
    status: market.status,
    description: market.description || null,
    area_m2: market.area_m2 || null,
    total_shop: market.total_shop || null,
    
    // Parking: extract from object to columns
    parking_available: market.parking?.available ?? false,
    parking_accessible: market.parking?.accessible ?? false,
    parking_notes: market.parking?.notes || null,
    
    // Amenities: extract from object to columns
    amen_toilet: market.amenities?.toilet ?? false,
    amen_prayer_room: market.amenities?.prayer_room ?? false,
    
    // Contact: keep as JSONB (optional)
    contact: market.contact ? JSON.stringify(market.contact) : null,
    
    // Location: keep as JSONB (optional)
    location: market.location ? JSON.stringify(market.location) : null,
    
    // Schedule: keep as JSONB array
    schedule: JSON.stringify(market.schedule),
  }
}

/**
 * Transform database row back to Market object format
 */
export function dbRowToMarket(row: any): Market {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    district: row.district,
    state: row.state,
    status: row.status,
    description: row.description || undefined,
    area_m2: row.area_m2 || 0,
    total_shop: row.total_shop || null,
    
    // Reconstruct parking object
    parking: {
      available: row.parking_available ?? false,
      accessible: row.parking_accessible ?? false,
      notes: row.parking_notes || '',
    },
    
    // Reconstruct amenities object
    amenities: {
      toilet: row.amen_toilet ?? false,
      prayer_room: row.amen_prayer_room ?? false,
    },
    
    // Parse JSONB back to objects (Supabase may return as objects or strings)
    contact: row.contact 
      ? (typeof row.contact === 'string' ? JSON.parse(row.contact) : row.contact)
      : undefined,
    location: row.location 
      ? (typeof row.location === 'string' ? JSON.parse(row.location) : row.location)
      : undefined,
    schedule: typeof row.schedule === 'string' 
      ? JSON.parse(row.schedule) 
      : row.schedule || [],
  }
}

/**
 * Batch insert markets into Supabase
 * 
 * @example
 * ```ts
 * import { marketsData } from '@/lib/markets-data'
 * import { createClient } from '@supabase/supabase-js'
 * 
 * const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
 * 
 * const rows = marketsData.map(marketToDbRow)
 * const { error } = await supabase.from('pasar_malams').insert(rows)
 * ```
 */
export function prepareBatchInsert(markets: Market[]) {
  return markets.map(marketToDbRow)
}

/**
 * Validate market data before insertion
 */
export function validateMarket(market: Market): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!market.id || market.id.trim() === '') {
    errors.push('Market ID is required')
  }
  
  if (!market.name || market.name.trim() === '') {
    errors.push('Market name is required')
  }
  
  if (!market.address || market.address.trim() === '') {
    errors.push('Market address is required')
  }
  
  if (!market.district || market.district.trim() === '') {
    errors.push('Market district is required')
  }
  
  if (!market.state || market.state.trim() === '') {
    errors.push('Market state is required')
  }
  
  if (!market.schedule || !Array.isArray(market.schedule) || market.schedule.length === 0) {
    errors.push('Market schedule must be a non-empty array')
  }
  
  // Validate schedule structure
  market.schedule.forEach((sched, idx) => {
    if (!Array.isArray(sched.days) || sched.days.length === 0) {
      errors.push(`Schedule ${idx}: days must be a non-empty array`)
    }
    
    if (!Array.isArray(sched.times) || sched.times.length === 0) {
      errors.push(`Schedule ${idx}: times must be a non-empty array`)
    }
    
    sched.times.forEach((time, timeIdx) => {
      if (!time.start || !time.end) {
        errors.push(`Schedule ${idx}, time ${timeIdx}: start and end are required`)
      }
      
      // Validate time format (HH:mm)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(time.start) || !timeRegex.test(time.end)) {
        errors.push(`Schedule ${idx}, time ${timeIdx}: invalid time format (expected HH:mm)`)
      }
    })
  })
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Example migration script
 * 
 * Run this to migrate all markets from TypeScript to Supabase
 */
export async function migrateMarketsToSupabase(
  supabase: any, // Supabase client
  markets: Market[],
  options: { batchSize?: number; dryRun?: boolean } = {}
) {
  const { batchSize = 100, dryRun = false } = options
  
  const validMarkets: Market[] = []
  const invalidMarkets: Array<{ market: Market; errors: string[] }> = []
  
  // Validate all markets first
  for (const market of markets) {
    const validation = validateMarket(market)
    if (validation.valid) {
      validMarkets.push(market)
    } else {
      invalidMarkets.push({ market, errors: validation.errors })
    }
  }
  
  console.log(`✓ Valid markets: ${validMarkets.length}`)
  if (invalidMarkets.length > 0) {
    console.warn(`⚠ Invalid markets: ${invalidMarkets.length}`)
    invalidMarkets.forEach(({ market, errors }) => {
      console.warn(`  - ${market.id || market.name}: ${errors.join(', ')}`)
    })
  }
  
  if (dryRun) {
    console.log('🔍 Dry run mode - no data will be inserted')
    return { validCount: validMarkets.length, invalidCount: invalidMarkets.length }
  }
  
  // Batch insert
  const rows = prepareBatchInsert(validMarkets)
  let inserted = 0
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('pasar_malams').insert(batch)
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      throw error
    }
    
    inserted += batch.length
    console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} markets (${inserted}/${rows.length})`)
  }
  
  return {
    inserted,
    validCount: validMarkets.length,
    invalidCount: invalidMarkets.length,
  }
}

