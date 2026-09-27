/**
 * One-time backup export of all rows from the live Supabase project.
 *
 * Writes timestamped JSON backups (raw rows, exact fidelity) plus a
 * manifest with row counts, for both tables:
 *   - pasar_malams
 *   - market_suggestions
 *
 * Usage:
 *   node scripts/backup-supabase.mjs
 *
 * Requires in .env (repo root):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const TABLES = ["pasar_malams", "market_suggestions"];
const PAGE_SIZE = 1000;
const OUT_DIR = path.join("docs", "archive", "supabase");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function dumpTable(table) {
  const rows = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to page ${table} at offset ${from}: ${error.message}`);
    }

    rows.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const summary = { exportedAt: new Date().toISOString(), tables: {} };

await mkdir(OUT_DIR, { recursive: true });

for (const table of TABLES) {
  process.stdout.write(`Exporting ${table}... `);
  const rows = await dumpTable(table);
  const file = path.join(OUT_DIR, `${table}-${timestamp}.json`);
  await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  summary.tables[table] = { rows: rows.length, file: path.basename(file) };
  console.log(`${rows.length} rows -> ${path.basename(file)}`);
}

const manifestFile = path.join(OUT_DIR, `backup-manifest-${timestamp}.json`);
await writeFile(manifestFile, JSON.stringify(summary, null, 2), "utf8");
console.log(`Manifest -> ${path.basename(manifestFile)}`);