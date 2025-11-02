/**
 * Database setup script for Supabase
 * 
 * This script:
 * 1. Creates the pasar_malams table with all indexes and policies
 * 2. Optionally inserts sample data from the SQL file
 * 
 * Usage:
 * 1. Ensure environment variables are set in .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL (required)
 *    - SUPABASE_SERVICE_ROLE_KEY (required)
 *    - DATABASE_URL (optional - PostgreSQL connection string for automatic setup)
 * 
 * 2. Run with: npx tsx scripts/setup-database.ts
 * 
 * If DATABASE_URL is not set, the script will show instructions
 * for manual setup via Supabase Dashboard SQL Editor.
 * 
 * To get DATABASE_URL:
 * 1. Go to Supabase Dashboard > Settings > Database
 * 2. Find "Connection string" section
 * 3. Copy the "URI" connection string
 * 4. Add to .env.local as: DATABASE_URL="postgresql://..."
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const databaseUrl = process.env.DATABASE_URL

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required environment variables:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - SUPABASE_SERVICE_ROLE_KEY\n' +
      '\nPlease set these in your .env.local file.'
    )
  }

  // Read SQL file
  const sqlPath = resolve(process.cwd(), 'scripts/create-markets-table-jsonb-optimized.sql')
  console.log(`📄 Reading SQL file: ${sqlPath}`)
  
  let sql: string
  try {
    sql = readFileSync(sqlPath, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read SQL file: ${error}`)
  }

  // Note: We'll execute the full SQL including sample data
  // The sample data will be checked and inserted if table is empty

  console.log('✓ SQL file loaded\n')

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Method 1: Try using direct PostgreSQL connection
  // Construct DATABASE_URL from Supabase URL if not provided
  const connectionString = databaseUrl || constructDatabaseUrl(supabaseUrl, serviceRoleKey)
  
  if (connectionString) {
    console.log('📡 Using direct PostgreSQL connection...')
    await executeWithPg(sql, connectionString)
  } else {
    // Method 2: Provide instructions for manual setup
    console.log('📡 Cannot execute SQL automatically.')
    await showManualInstructions(sqlPath)
  }

  // Verify table creation
  console.log('\n🔍 Verifying table creation...')
  const { data, error } = await supabase
    .from('pasar_malams')
    .select('id')
    .limit(1)

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means "no rows returned" which is fine for empty table
    throw new Error(`Table verification failed: ${error.message}`)
  }

  console.log('✓ Table created successfully!\n')

  // Check if sample data should be inserted
  const { count } = await supabase
    .from('pasar_malams')
    .select('*', { count: 'exact', head: true })

  if (count === 0) {
    console.log('📦 Table is empty. Sample data from SQL file will be inserted.')
    await insertSampleData(supabase, sql)
  } else {
    console.log(`ℹ️  Table already contains ${count} market(s). Skipping sample data insertion.`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Database setup completed!')
  console.log('='.repeat(50))
  console.log('\nNext steps:')
  console.log('  1. Run data migration: npx tsx scripts/run-migration.ts')
  console.log('  2. Verify data in Supabase dashboard')
  console.log('')
}

/**
 * Execute SQL using direct PostgreSQL connection (pg package)
 */
async function executeWithPg(sql: string, databaseUrl: string) {
  try {
    // Dynamic import to avoid requiring pg as a dependency if not needed
    const { Client } = await import('pg')
    const client = new Client({ connectionString: databaseUrl })
    
    await client.connect()
    console.log('✓ Connected to PostgreSQL\n')

    // Split SQL into statements while preserving multi-line statements
    // Remove comments and split by semicolons (outside of strings)
    let cleanedSql = sql
    
    // Remove single-line comments (-- ...)
    cleanedSql = cleanedSql.replace(/--[^\r\n]*/g, '')
    
    // Remove multi-line comments (/* ... */)
    cleanedSql = cleanedSql.replace(/\/\*[\s\S]*?\*\//g, '')
    
    // Split by semicolons and filter empty statements
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Filter out empty statements and example queries
        if (s.length === 0) return false
        if (s.toLowerCase().includes('example')) return false
        if (s.toLowerCase().startsWith('select') && s.toLowerCase().includes('--')) return false
        return true
      })

    console.log(`📝 Executing ${statements.length} SQL statements...\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      try {
        await client.query(statement + ';')
        console.log(`✓ [${i + 1}/${statements.length}] Executed`)
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.code === '42710' || error.message.includes('already exists')) {
          console.log(`ℹ️  [${i + 1}/${statements.length}] Already exists (skipped)`)
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message)
          throw error
        }
      }
    }

    await client.end()
    console.log('\n✓ All SQL statements executed successfully')
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('pg')) {
      throw new Error(
        'PostgreSQL client (pg) not found.\n' +
        'Install it with: pnpm add -D pg @types/pg\n' +
        'Or use Supabase REST API by not setting DATABASE_URL'
      )
    }
    throw error
  }
}

/**
 * Construct PostgreSQL connection string from Supabase URL
 * Note: This is a fallback - ideally users should get the connection string from Supabase dashboard
 */
function constructDatabaseUrl(supabaseUrl: string, serviceRoleKey: string): string | null {
  try {
    // Extract project reference from Supabase URL
    // Format: https://xxxxx.supabase.co
    const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (!urlMatch) {
      return null
    }

    const projectRef = urlMatch[1]
    
    // Construct connection string
    // Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    // However, we need the password which is the service role key
    // Actually, service role key is not the same as database password
    
    // For now, return null - user needs to provide DATABASE_URL
    // They can get it from Supabase Dashboard > Settings > Database > Connection string
    return null
  } catch {
    return null
  }
}

/**
 * Show instructions for manual SQL execution
 */
async function showManualInstructions(sqlPath: string) {
  console.log('\n' + '='.repeat(60))
  console.log('📋 MANUAL SETUP INSTRUCTIONS')
  console.log('='.repeat(60))
  console.log('\nTo create the table, you have two options:\n')
  
  console.log('OPTION 1: Use Supabase Dashboard (Recommended)')
  console.log('  1. Go to your Supabase Dashboard')
  console.log('  2. Navigate to SQL Editor')
  console.log('  3. Click "New query"')
  console.log(`  4. Copy and paste the contents of: ${sqlPath}`)
  console.log('  5. Click "Run" to execute\n')
  
  console.log('OPTION 2: Set DATABASE_URL in .env.local')
  console.log('  1. Go to Supabase Dashboard > Settings > Database')
  console.log('  2. Find "Connection string" section')
  console.log('  3. Copy the "URI" connection string')
  console.log('  4. Add it to .env.local as: DATABASE_URL="postgresql://..."')
  console.log('  5. Run this script again\n')
  
  console.log('='.repeat(60) + '\n')
  
  throw new Error('Please set up the database manually or provide DATABASE_URL')
}

/**
 * Insert sample data from SQL file
 */
async function insertSampleData(supabase: any, sql: string) {
  // Extract INSERT statement from SQL
  const insertMatch = sql.match(/INSERT INTO pasar_malams[^;]+;/is)
  
  if (!insertMatch) {
    console.log('ℹ️  No sample data found in SQL file')
    return
  }

  console.log('\n📦 Extracting sample data from SQL...')
  
  // Parse the INSERT statement to extract values
  // This is a simplified parser - for production, use a proper SQL parser
  try {
    // Extract values part
    const valuesMatch = insertMatch[0].match(/VALUES\s*\(([^)]+)\)/is)
    if (!valuesMatch) {
      console.log('⚠️  Could not parse sample data from SQL')
      return
    }

    // For now, we'll extract the sample data manually from the SQL
    // The SQL file has one sample market: 'taman-melawati-kl'
    
    // Check if it already exists
    const { data: existing } = await supabase
      .from('pasar_malams')
      .select('id')
      .eq('id', 'taman-melawati-kl')
      .single()

    if (existing) {
      console.log('ℹ️  Sample data already exists')
      return
    }

    // Insert sample market from SQL file
    const sampleMarket = {
      id: 'taman-melawati-kl',
      name: 'Pasar Malam Taman Melawati',
      address: 'Pusat Bandar, 311, Lorong Selangor, Taman Melawati, 53100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
      district: 'Kuala Lumpur',
      state: 'Kuala Lumpur',
      status: 'Active',
      description: 'One of the most popular night markets in Kuala Lumpur, Pasar Malam Taman Melawati offers a wide variety of local street food, fresh produce, and household items. Known for its vibrant atmosphere and authentic Malaysian cuisine.',
      area_m2: 4590.72,
      total_shop: 45,
      parking_available: true,
      parking_accessible: true,
      parking_notes: 'Limited roadside parking available. Best to arrive early for better parking spots.',
      amen_toilet: true,
      amen_prayer_room: true,
      contact: null,
      location: {
        latitude: 3.2104933,
        longitude: 101.7493301,
        gmaps_link: 'https://maps.app.goo.gl/QmFnDaXLgfLxY8LM8'
      },
      schedule: [
        { days: ['tue'], times: [{ start: '17:00', end: '22:00', note: 'Night market' }] },
        { days: ['thu'], times: [{ start: '17:00', end: '22:00', note: 'Night market' }] },
        {
          days: ['sat'],
          times: [
            { start: '07:00', end: '11:00', note: 'Morning market' },
            { start: '17:00', end: '22:00', note: 'Evening market' }
          ]
        }
      ]
    }

    const { error } = await supabase.from('pasar_malams').insert(sampleMarket)

    if (error) {
      console.error('❌ Error inserting sample data:', error)
      throw error
    }

    console.log('✓ Sample data inserted successfully')
  } catch (error: any) {
    console.error('⚠️  Error inserting sample data:', error.message)
    console.log('   You can insert data manually later using: npx tsx scripts/run-migration.ts')
  }
}

// Run the setup
setupDatabase().catch((error) => {
  console.error('\n❌ Setup failed:', error.message)
  if (error.stack) {
    console.error('\nStack trace:', error.stack)
  }
  process.exit(1)
})

