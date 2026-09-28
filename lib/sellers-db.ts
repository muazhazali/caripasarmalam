/**
 * Database helper functions for sellers (D1/SQLite).
 * Server-side only. Client components must use lib/sellers-api-client.ts.
 *
 * Every seller write keeps seller_items, seller_locations, seller_location_days
 * and the seller_fts index in sync (D1 has no client-side transactions, so
 * multi-statement writes use db.batch()).
 */

import { getDB, newId, nowIso, parseJson } from "./d1";
import type { D1Database } from "./d1";
import { DayCode } from "@/app/enums";
import type { Seller, SellerItem, SellerLocation, SellerSocialLink } from "./seller-types";
import type { SellerFormValues } from "./seller-schema";
import type { Weekday } from "./market-types";

export interface SellerFilters {
  q?: string;
  category?: string;
  marketId?: string;
  day?: Weekday;
  state?: string;
  district?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

interface SellerDbRow {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  phone: string | null;
  social: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SellerItemDbRow {
  id: string;
  seller_id: string;
  name: string;
  price: number | null;
  note: string | null;
  sort_order: number;
}

interface SellerLocationDbRow {
  id: string;
  seller_id: string;
  market_id: string;
  stall: string | null;
  notes: string | null;
  market_name?: string;
  market_district?: string;
  market_state?: string;
}

interface SellerLocationDayDbRow {
  seller_location_id: string;
  day: string;
}

function rowToSeller(row: SellerDbRow): Seller {
  return {
    id: row.id,
    name: row.name,
    category: row.category || undefined,
    description: row.description || undefined,
    phone: row.phone || undefined,
    social: parseJson<SellerSocialLink[]>(row.social, []),
    status: (row.status as Seller["status"]) || "Active",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function attachSellerRelations(db: D1Database, sellers: Seller[]): Promise<Seller[]> {
  if (sellers.length === 0) return sellers;

  const ids = sellers.map((s) => s.id);
  const placeholders = ids.map(() => "?").join(", ");

  const [itemsRes, locationsRes, daysRes] = await Promise.all([
    db
      .prepare(`SELECT * FROM seller_items WHERE seller_id IN (${placeholders}) ORDER BY seller_id, sort_order, name`)
      .bind(...ids)
      .all<SellerItemDbRow>(),
    db
      .prepare(
        `SELECT sl.*, pm.name AS market_name, pm.district AS market_district, pm.state AS market_state
         FROM seller_locations sl
         JOIN pasar_malams pm ON pm.id = sl.market_id
         WHERE sl.seller_id IN (${placeholders})`,
      )
      .bind(...ids)
      .all<SellerLocationDbRow>(),
    db
      .prepare(
        `SELECT sld.* FROM seller_location_days sld
         JOIN seller_locations sl ON sl.id = sld.seller_location_id
         WHERE sl.seller_id IN (${placeholders})`,
      )
      .bind(...ids)
      .all<SellerLocationDayDbRow>(),
  ]);

  const itemsBySeller = new Map<string, SellerItem[]>();
  for (const row of itemsRes.results ?? []) {
    const list = itemsBySeller.get(row.seller_id) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      price: row.price,
      note: row.note || undefined,
      sort_order: row.sort_order,
    });
    itemsBySeller.set(row.seller_id, list);
  }

  const daysByLocation = new Map<string, DayCode[]>();
  for (const row of daysRes.results ?? []) {
    const list = daysByLocation.get(row.seller_location_id) ?? [];
    list.push(row.day as DayCode);
    daysByLocation.set(row.seller_location_id, list);
  }

  const locationsBySeller = new Map<string, SellerLocation[]>();
  for (const row of locationsRes.results ?? []) {
    const list = locationsBySeller.get(row.seller_id) ?? [];
    list.push({
      id: row.id,
      market_id: row.market_id,
      market_name: row.market_name,
      market_district: row.market_district,
      market_state: row.market_state,
      days: (daysByLocation.get(row.id) ?? []).sort(byDayOrder),
      stall: row.stall || undefined,
      notes: row.notes || undefined,
    });
    locationsBySeller.set(row.seller_id, list);
  }

  return sellers.map((seller) => ({
    ...seller,
    items: itemsBySeller.get(seller.id) ?? [],
    locations: locationsBySeller.get(seller.id) ?? [],
  }));
}

const DAY_ORDER: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

function byDayOrder(a: string, b: string): number {
  return (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99);
}

export async function getSellers(filters: SellerFilters = {}): Promise<Seller[]> {
  const db = await getDB();
  const where: string[] = ["s.status = ?"];
  const params: unknown[] = [filters.status ?? "Active"];

  if (filters.category) {
    where.push("s.category = ?");
    params.push(filters.category);
  }

  if (filters.state) {
    where.push(
      "EXISTS (SELECT 1 FROM seller_locations sl2 JOIN pasar_malams pm2 ON pm2.id = sl2.market_id WHERE sl2.seller_id = s.id AND pm2.state = ?)",
    );
    params.push(filters.state);
  }

  if (filters.district) {
    where.push(
      "EXISTS (SELECT 1 FROM seller_locations sl3 JOIN pasar_malams pm3 ON pm3.id = sl3.market_id WHERE sl3.seller_id = s.id AND pm3.district = ?)",
    );
    params.push(filters.district);
  }

  if (filters.marketId) {
    where.push("EXISTS (SELECT 1 FROM seller_locations sl4 WHERE sl4.seller_id = s.id AND sl4.market_id = ?)");
    params.push(filters.marketId);
  }

  if (filters.day) {
    where.push(
      "EXISTS (SELECT 1 FROM seller_locations sl5 JOIN seller_location_days sld ON sld.seller_location_id = sl5.id WHERE sl5.seller_id = s.id AND sld.day = ?)",
    );
    params.push(filters.day);
  }

  if (filters.q && filters.q.trim().length > 0) {
    const like = `%${filters.q.trim()}%`;
    where.push(
      "(s.name LIKE ? COLLATE NOCASE OR s.category LIKE ? COLLATE NOCASE OR EXISTS (SELECT 1 FROM seller_items si WHERE si.seller_id = s.id AND si.name LIKE ? COLLATE NOCASE))",
    );
    params.push(like, like, like);
  }

  const limit = Math.min(filters.limit ?? 100, 1000);
  const offset = filters.offset ?? 0;

  const result = await db
    .prepare(`SELECT s.* FROM sellers s WHERE ${where.join(" AND ")} ORDER BY s.name LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all<Record<string, unknown>>();

  const sellers = (result.results ?? []).map((r) => rowToSeller(r as unknown as SellerDbRow));
  return attachSellerRelations(db, sellers);
}

export async function getSellerById(id: string): Promise<Seller | null> {
  const db = await getDB();
  const row = await db.prepare("SELECT * FROM sellers WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!row) return null;

  const [seller] = await attachSellerRelations(db, [rowToSeller(row as unknown as SellerDbRow)]);
  return seller;
}

export async function getSellersByMarket(marketId: string): Promise<Seller[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT DISTINCT s.* FROM sellers s
       JOIN seller_locations sl ON sl.seller_id = s.id
       WHERE sl.market_id = ? AND s.status = 'Active'
       ORDER BY s.name`,
    )
    .bind(marketId)
    .all<Record<string, unknown>>();

  const sellers = (result.results ?? []).map((r) => rowToSeller(r as unknown as SellerDbRow));
  // Keep only the requested market in each seller's locations for this view
  const attached = await attachSellerRelations(db, sellers);
  return attached.map((s) => ({
    ...s,
    locations: (s.locations ?? []).filter((l) => l.market_id === marketId),
  }));
}

/**
 * Search sellers via the FTS index over item names, seller names and categories.
 * Prefix-match each whitespace-separated token so "nasi lem" finds "Nasi Lemak".
 */
export async function searchSellers(q: string, limit = 50): Promise<Seller[]> {
  const trimmed = q.trim();
  if (trimmed.length === 0) return [];

  const db = await getDB();
  const tokens = trimmed
    .split(/\s+/)
    .slice(0, 8)
    .map((t) => `"${t.replace(/"/g, "")}"*`)
    .join(" ");
  if (tokens.length === 0) return [];

  const result = await db
    .prepare(
      `SELECT s.* FROM sellers s
       JOIN seller_fts f ON f.seller_id = s.id
       WHERE seller_fts MATCH ? AND s.status = 'Active'
       ORDER BY s.name
       LIMIT ?`,
    )
    .bind(tokens, limit)
    .all<Record<string, unknown>>();

  const sellers = (result.results ?? []).map((r) => rowToSeller(r as unknown as SellerDbRow));
  return attachSellerRelations(db, sellers);
}

export async function getSellerCategories(): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      "SELECT DISTINCT category FROM sellers WHERE status = 'Active' AND category IS NOT NULL AND category != '' ORDER BY category",
    )
    .all<{ category: string }>();
  return (results ?? []).map((r) => r.category);
}

export async function getAdminSellers(page = 1, pageSize = 50): Promise<{ sellers: Seller[]; count: number }> {
  const db = await getDB();
  const offset = (page - 1) * pageSize;

  const [{ results }, countRow] = await Promise.all([
    db
      .prepare("SELECT * FROM sellers ORDER BY name LIMIT ? OFFSET ?")
      .bind(pageSize, offset)
      .all<Record<string, unknown>>(),
    db.prepare("SELECT COUNT(*) AS n FROM sellers").first<{ n: number }>(),
  ]);

  const sellers = (results ?? []).map((r) => rowToSeller(r as unknown as SellerDbRow));
  return { sellers: await attachSellerRelations(db, sellers), count: countRow?.n ?? 0 };
}

/** Rebuild the FTS row for one seller from its items + profile. */
async function syncSellerFts(db: D1Database, sellerId: string, seller: Seller, items: SellerItem[]): Promise<void> {
  await db.prepare("DELETE FROM seller_fts WHERE seller_id = ?").bind(sellerId).run();
  const content = [seller.name, seller.category ?? "", ...items.map((i) => i.name)].filter(Boolean).join(" \n ");
  await db.prepare("INSERT INTO seller_fts (seller_id, content) VALUES (?, ?)").bind(sellerId, content).run();
}

async function syncSellerLocations(db: D1Database, sellerId: string, seller: Seller): Promise<void> {
  await db.prepare("DELETE FROM seller_locations WHERE seller_id = ?").bind(sellerId).run();
  for (const loc of seller.locations ?? []) {
    const locationId = loc.id || newId();
    await db
      .prepare("INSERT INTO seller_locations (id, seller_id, market_id, stall, notes) VALUES (?, ?, ?, ?, ?)")
      .bind(locationId, sellerId, loc.market_id, loc.stall ?? null, loc.notes ?? null)
      .run();
    if (loc.days.length === 0) continue;
    const placeholders = loc.days.map(() => "(?, ?)").join(", ");
    await db
      .prepare(`INSERT OR IGNORE INTO seller_location_days (seller_location_id, day) VALUES ${placeholders}`)
      .bind(...loc.days.flatMap((d) => [locationId, d]))
      .run();
  }
}

export async function insertSellerFromForm(data: SellerFormValues, existingId?: string): Promise<string> {
  const db = await getDB();
  const id = existingId ?? newId();
  const ts = nowIso();

  await db
    .prepare(
      `INSERT INTO sellers (id, name, category, description, phone, social, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      data.name,
      data.category || null,
      data.description || null,
      data.phone || null,
      data.social && data.social.length > 0 ? JSON.stringify(data.social) : null,
      data.status,
      ts,
      ts,
    )
    .run();

  await writeSellerChildren(db, id, data);
  return id;
}

export async function updateSellerFromForm(id: string, data: SellerFormValues): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE sellers SET name = ?, category = ?, description = ?, phone = ?, social = ?, status = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      data.name,
      data.category || null,
      data.description || null,
      data.phone || null,
      data.social && data.social.length > 0 ? JSON.stringify(data.social) : null,
      data.status,
      nowIso(),
      id,
    )
    .run();

  await writeSellerChildren(db, id, data);
}

async function writeSellerChildren(db: D1Database, id: string, data: SellerFormValues): Promise<void> {
  await db.prepare("DELETE FROM seller_items WHERE seller_id = ?").bind(id).run();
  const items: SellerItem[] = (data.items ?? []).map((item, i) => ({
    id: newId(),
    name: item.name,
    price: item.price ?? null,
    note: item.note || undefined,
    sort_order: i,
  }));
  for (const item of items) {
    await db
      .prepare("INSERT INTO seller_items (id, seller_id, name, price, note, sort_order) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(item.id, id, item.name, item.price, item.note ?? null, item.sort_order)
      .run();
  }

  await syncSellerLocations(db, id, { ...data, id, items } as unknown as Seller);
  await syncSellerFts(db, id, { ...data, id, items } as unknown as Seller, items);
}

export async function deleteSellerById(id: string): Promise<void> {
  const db = await getDB();
  await db.batch([
    db.prepare("DELETE FROM seller_fts WHERE seller_id = ?").bind(id),
    db.prepare("DELETE FROM sellers WHERE id = ?").bind(id),
  ]);
}

export async function updateSellerStatus(id: string, status: string): Promise<void> {
  const db = await getDB();
  await db.prepare("UPDATE sellers SET status = ?, updated_at = ? WHERE id = ?").bind(status, nowIso(), id).run();
}
