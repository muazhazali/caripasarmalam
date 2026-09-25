/**
 * Database helper functions for markets (D1/SQLite).
 * Provides server-side query functions with filtering.
 */

import { boolToInt, getDB, nowIso, toDatabaseRow, type D1Database } from "./d1";
import { dbRowToMarket, marketFormToDbRow } from "./db-transform";
import type { Market, Weekday } from "./markets-data";
import type { MarketFormValues } from "./admin-schema";
import { getMarketOpenStatus } from "./utils";

/**
 * Filter options for querying markets
 */
export interface MarketFilters {
  state?: string;
  district?: string;
  day?: Weekday;
  status?: string;
  q?: string;
  amen_toilet?: boolean;
  amen_prayer_room?: boolean;
  parking_available?: boolean;
  parking_accessible?: boolean;
  limit?: number;
  offset?: number;
  // Note: open_now filtering is done client-side due to complex timezone logic
}

export async function getMarkets(filters: MarketFilters = {}): Promise<Market[]> {
  const db = await getDB();
  const where: string[] = [];
  const params: unknown[] = [];

  where.push("status = ?");
  params.push(filters.status ?? "Active");

  if (filters.state) {
    where.push("state = ?");
    params.push(filters.state);
  }

  if (filters.district) {
    where.push("district = ?");
    params.push(filters.district);
  }

  if (filters.amen_toilet !== undefined) {
    where.push("amen_toilet = ?");
    params.push(boolToInt(filters.amen_toilet));
  }

  if (filters.amen_prayer_room !== undefined) {
    where.push("amen_prayer_room = ?");
    params.push(boolToInt(filters.amen_prayer_room));
  }

  if (filters.parking_available !== undefined) {
    where.push("parking_available = ?");
    params.push(boolToInt(filters.parking_available));
  }

  if (filters.parking_accessible !== undefined) {
    where.push("parking_accessible = ?");
    params.push(boolToInt(filters.parking_accessible));
  }

  // Case-insensitive partial match across key text columns
  if (filters.q && filters.q.trim().length > 0) {
    const like = `%${filters.q.trim()}%`;
    where.push(
      "(name LIKE ? COLLATE NOCASE OR district LIKE ? COLLATE NOCASE OR state LIKE ? COLLATE NOCASE OR address LIKE ? COLLATE NOCASE)",
    );
    params.push(like, like, like, like);
  }

  let sql = "SELECT pm.* FROM pasar_malams pm";
  if (filters.day) {
    sql += " JOIN market_days md ON md.market_id = pm.id AND md.day = ?";
    params.unshift(filters.day);
  }
  sql += ` WHERE ${where.join(" AND ")}`;

  const limit = Math.min(filters.limit ?? 100, 1000);
  const offset = filters.offset ?? 0;
  sql += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<Record<string, unknown>>();
  return (result.results ?? []).map((r) => dbRowToMarket(toDatabaseRow(r)));
}

export async function getMarketById(id: string): Promise<Market | null> {
  const db = await getDB();
  const row = await db.prepare("SELECT * FROM pasar_malams WHERE id = ?").bind(id).first<Record<string, unknown>>();

  if (!row) return null;
  return dbRowToMarket(toDatabaseRow(row));
}

export function isMarketOpenNow(market: Market, now?: Date): boolean {
  return getMarketOpenStatus(market, now).status === "open";
}

export async function getAllStates(): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT DISTINCT state FROM pasar_malams WHERE status = 'Active' ORDER BY state")
    .all<{ state: string }>();
  return (results ?? []).map((r) => r.state);
}

export async function getDistrictsByState(state: string): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT DISTINCT district FROM pasar_malams WHERE state = ? AND status = 'Active' ORDER BY district")
    .bind(state)
    .all<{ district: string }>();
  return (results ?? []).map((r) => r.district);
}

export async function getAdminMarkets(page = 1, pageSize = 50): Promise<{ markets: Market[]; count: number }> {
  const db = await getDB();
  const offset = (page - 1) * pageSize;

  const [{ results }, countRow] = await Promise.all([
    db
      .prepare("SELECT * FROM pasar_malams ORDER BY name LIMIT ? OFFSET ?")
      .bind(pageSize, offset)
      .all<Record<string, unknown>>(),
    db.prepare("SELECT COUNT(*) AS n FROM pasar_malams").first<{ n: number }>(),
  ]);

  return {
    markets: (results ?? []).map((r) => dbRowToMarket(toDatabaseRow(r))),
    count: countRow?.n ?? 0,
  };
}

/**
 * Derived day codes from a schedule array (used to maintain market_days).
 */
function daysFromSchedule(schedule: MarketFormValues["schedule"]): string[] {
  const days = new Set<string>();
  for (const entry of schedule) {
    for (const day of entry.days) days.add(day);
  }
  return [...days];
}

async function syncMarketDays(db: D1Database, marketId: string, schedule: MarketFormValues["schedule"]) {
  await db.prepare("DELETE FROM market_days WHERE market_id = ?").bind(marketId).run();
  const days = daysFromSchedule(schedule);
  if (days.length === 0) return;
  const placeholders = days.map(() => "(?, ?)").join(", ");
  const params = days.flatMap((day) => [marketId, day]);
  await db
    .prepare(`INSERT OR IGNORE INTO market_days (market_id, day) VALUES ${placeholders}`)
    .bind(...params)
    .run();
}

/**
 * Write a market row from MarketFormValues. Used by admin CRUD and suggestion approval.
 * Sets created_at/updated_at and maintains market_days.
 */
export async function insertMarketFromForm(data: MarketFormValues, existingId?: string): Promise<string> {
  const db = await getDB();
  const row = marketFormToDbRow(data, existingId);
  const id = row.id;
  const ts = nowIso();

  await db
    .prepare(
      `INSERT INTO pasar_malams
        (id, name, address, district, state, status, description, area_m2, total_shop, shop_list,
         amen_toilet, amen_prayer_room, parking_available, parking_accessible, parking_notes,
         location, schedule, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      row.name,
      row.address,
      row.district,
      row.state,
      row.status,
      row.description,
      row.area_m2,
      row.total_shop,
      row.shop_list,
      boolToInt(row.amen_toilet),
      boolToInt(row.amen_prayer_room),
      boolToInt(row.parking_available),
      boolToInt(row.parking_accessible),
      row.parking_notes,
      row.location ? JSON.stringify(row.location) : null,
      JSON.stringify(row.schedule),
      ts,
      ts,
    )
    .run();

  await syncMarketDays(db, id, row.schedule);
  return id;
}

export async function updateMarketFromForm(id: string, data: MarketFormValues): Promise<void> {
  const db = await getDB();
  const row = marketFormToDbRow(data);

  await db
    .prepare(
      `UPDATE pasar_malams SET
        name = ?, address = ?, district = ?, state = ?, status = ?, description = ?,
        area_m2 = ?, total_shop = ?, shop_list = ?,
        amen_toilet = ?, amen_prayer_room = ?, parking_available = ?, parking_accessible = ?, parking_notes = ?,
        location = ?, schedule = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      row.name,
      row.address,
      row.district,
      row.state,
      row.status,
      row.description,
      row.area_m2,
      row.total_shop,
      row.shop_list,
      boolToInt(row.amen_toilet),
      boolToInt(row.amen_prayer_room),
      boolToInt(row.parking_available),
      boolToInt(row.parking_accessible),
      row.parking_notes,
      row.location ? JSON.stringify(row.location) : null,
      JSON.stringify(row.schedule),
      nowIso(),
      id,
    )
    .run();

  await syncMarketDays(db, id, row.schedule);
}

export async function deleteMarketById(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM pasar_malams WHERE id = ?").bind(id).run();
}

export async function updateMarketStatus(id: string, status: string): Promise<void> {
  const db = await getDB();
  await db.prepare("UPDATE pasar_malams SET status = ?, updated_at = ? WHERE id = ?").bind(status, nowIso(), id).run();
}
