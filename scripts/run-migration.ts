/**
 * One-time migration script to populate Supabase database with markets data
 * 
 * Usage:
 * 1. Ensure environment variables are set in .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 * 
 * 2. Run with: npx tsx scripts/run-migration.ts
 * 
 * This script:
 * - Validates all markets data
 * - Transforms TypeScript Market objects to database format
 * - Inserts markets into Supabase in batches
 * - Provides progress and error reporting
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { marketsData } from '@/lib/markets-data'
import {
  marketToDbRow,
  validateMarket,
  migrateMarketsToSupabase,
  prepareBatchInsert,
} from './migrate-typescript-to-db'
import { createServiceRoleClient } from '@/lib/supabase'

async function main() {
  console.log('🚀 Starting markets data migration to Supabase...\n')

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  // Create Supabase client with service role key
  const supabase = createServiceRoleClient()

  // Test connection
  console.log('📡 Testing Supabase connection...')
  const { error: testError } = await supabase.from('pasar_malams').select('id').limit(1)
  
  if (testError && testError.code !== 'PGRST116') {
    // PGRST116 means "no rows returned" which is fine for empty table
    console.error('❌ Connection test failed:', testError)
    throw new Error(`Failed to connect to Supabase: ${testError.message}`)
  }

  console.log('✓ Connection successful\n')

  // Check if table is empty
  const { count } = await supabase.from('pasar_malams').select('*', { count: 'exact', head: true })
  
  if (count && count > 0) {
    console.warn(`⚠️  Warning: Table already contains ${count} markets`)
    console.log('   This script will insert additional markets (or skip duplicates based on id)\n')
  }

  // Get total count
  const totalMarkets = marketsData.length
  console.log(`📊 Total markets to migrate: ${totalMarkets}\n`)

  // Validate all markets first
  console.log('🔍 Validating markets data...')
  const validMarkets: typeof marketsData = []
  const invalidMarkets: Array<{ market: typeof marketsData[0]; errors: string[] }> = []

  for (const market of marketsData) {
    const validation = validateMarket(market)
    if (validation.valid) {
      validMarkets.push(market)
    } else {
      invalidMarkets.push({ market, errors: validation.errors })
    }
  }

  console.log(`✓ Valid markets: ${validMarkets.length}`)
  if (invalidMarkets.length > 0) {
    console.warn(`⚠️  Invalid markets: ${invalidMarkets.length}`)
    invalidMarkets.forEach(({ market, errors }) => {
      console.warn(`   - ${market.id || market.name}: ${errors.join(', ')}`)
    })
    console.log('')
  }

  if (validMarkets.length === 0) {
    throw new Error('No valid markets to migrate')
  }

  // Run migration
  console.log('📦 Starting batch insertion...\n')
  const result = await migrateMarketsToSupabase(supabase, validMarkets, {
    batchSize: 100,
    dryRun: false,
  })

  console.log('\n' + '='.repeat(50))
  console.log('✅ Migration completed!')
  console.log('='.repeat(50))
  console.log(`📊 Summary:`)
  console.log(`   - Inserted: ${result.inserted}`)
  console.log(`   - Valid: ${result.validCount}`)
  if (result.invalidCount > 0) {
    console.log(`   - Invalid: ${result.invalidCount}`)
  }
  console.log('')

  // Verify final count
  const { count: finalCount } = await supabase
    .from('pasar_malams')
    .select('*', { count: 'exact', head: true })

  console.log(`📈 Total markets in database: ${finalCount}`)
  console.log('')

  if (finalCount && finalCount < result.inserted) {
    console.warn('⚠️  Warning: Some markets may not have been inserted (duplicates skipped?)')
  }

  console.log('✨ Done!')
}

// Run the migration
main().catch((error) => {
  console.error('\n❌ Migration failed:', error)
  process.exit(1)
})

