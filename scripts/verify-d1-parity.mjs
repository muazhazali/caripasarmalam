/**
 * Parity verification: local D1 vs Supabase backup JSON.
 *
 * Checks:
 *  1. Row counts match the backup for both tables
 *  2. Field-by-field match on a random sample of 10 markets
 *  3. Every market's derived market_days matches its schedule JSON
 *
 * Usage:
 *   node scripts/verify-d1-parity.mjs
 *
 * Uses wrangler d1 execute --local (JSON output) — requires wrangler.jsonc.
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const BACKUP_DIR = path.join("docs", "archive", "supabase");

function latestBackup(prefix) {
  const files = readdirSync(BACKUP_DIR).filter((f) => f.startsWith(prefix) && f.endsWith(".json"));
  files.sort();
  return JSON.parse(readFileSync(path.join(BACKUP_DIR, files[files.length - 1]), "utf8"));
}

function d1Query(sql) {
  const out = execSync(`npx wrangler d1 execute caripasarmalam --local --json --command "${sql.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const parsed = JSON.parse(out.slice(out.indexOf("[")));
  return parsed[0].results;
}

let failures = 0;
function check(label, ok, detail = "") {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label} ${detail}`);
  }
}

console.log("1. Row counts");
const markets = latestBackup("pasar_malams-");
const suggestions = latestBackup("market_suggestions-");

const [{ n: d1Markets }] = d1Query("SELECT COUNT(*) AS n FROM pasar_malams");
const [{ n: d1Suggestions }] = d1Query("SELECT COUNT(*) AS n FROM market_suggestions");
check(`pasar_malams count ${markets.length}`, d1Markets === markets.length, `(d1: ${d1Markets})`);
check(`market_suggestions count ${suggestions.length}`, d1Suggestions === suggestions.length, `(d1: ${d1Suggestions})`);

console.log("2. Field-by-field sample (10 random markets)");
const sample = [...markets].sort(() => Math.random() - 0.5).slice(0, 10);
const boolFields = ["parking_available", "parking_accessible", "amen_toilet", "amen_prayer_room"];

for (const m of sample) {
  const rows = d1Query(`SELECT * FROM pasar_malams WHERE id = '${m.id.replace(/'/g, "''")}'`);
  const row = rows[0];
  if (!row) {
    check(`market ${m.id} exists`, false, "not found in D1");
    continue;
  }

  let ok = row.name === m.name && row.state === m.state && row.district === m.district && row.status === m.status;
  for (const f of boolFields) {
    ok = ok && (row[f] === 1) === !!m[f];
  }
  ok = ok && JSON.stringify(JSON.parse(row.schedule)) === JSON.stringify(m.schedule);
  ok = ok && (row.location === null) === (m.location === null || m.location === undefined);

  check(`market ${m.id}`, ok);
}

console.log("3. market_days consistency");
const [{ n: dayRowCount }] = d1Query("SELECT COUNT(*) AS n FROM market_days");
const [{ n: orphanCount }] = d1Query(
  "SELECT COUNT(*) AS n FROM market_days md LEFT JOIN pasar_malams pm ON pm.id = md.market_id WHERE pm.id IS NULL",
);

let expectedDayRows = 0;
for (const m of markets) {
  const days = new Set();
  for (const entry of m.schedule ?? []) for (const d of entry?.days ?? []) days.add(d);
  expectedDayRows += days.size;
}
check(`market_days row count ${expectedDayRows}`, dayRowCount === expectedDayRows, `(d1: ${dayRowCount})`);
check("no orphan market_days", orphanCount === 0, `(orphans: ${orphanCount})`);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll parity checks passed.");