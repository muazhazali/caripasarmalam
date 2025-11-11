/**
 * Shared utility for transforming Supabase database rows to Market objects
 * This avoids code duplication across client and server components
 */

import type { Market, MarketSchedule } from "./markets-data";

/**
 * Database row structure from Supabase
 * Represents the flattened schema where nested objects are stored as JSONB or separate columns
 */

/**
 * Transform a database row to a Market object
 * Handles JSONB parsing (both string and object formats)
 */
export function dbRowToMarket(row: DatabaseRow): Market {
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

    // Parse comma-separated shop list into array
    shop_list:
      typeof row.shop_list === "string" && row.shop_list.trim().length > 0
        ? row.shop_list
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined,

    // Reconstruct parking object
    parking: {
      available: row.parking_available ?? false,
      accessible: row.parking_accessible ?? false,
      notes: row.parking_notes || "",
    },

    // Reconstruct amenities object
    amenities: {
      toilet: row.amen_toilet ?? false,
      prayer_room: row.amen_prayer_room ?? false,
    },

    // Parse JSONB back to objects (Supabase may return as objects or strings)
    contact: row.contact ? (typeof row.contact === "string" ? JSON.parse(row.contact) : row.contact) : undefined,
    location: row.location ? (typeof row.location === "string" ? JSON.parse(row.location) : row.location) : undefined,
    schedule: typeof row.schedule === "string" ? JSON.parse(row.schedule) : row.schedule || [],
  };
}

/**
 * Transform multiple database rows to Market objects
 */
export function dbRowsToMarkets(rows: DatabaseRow[]): Market[] {
  return rows.map(dbRowToMarket);
}

export interface DatabaseRow {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  status: string;
  description?: string | null;
  area_m2?: number | null;
  total_shop?: number | null;
  shop_list?: string | null;

  // Parking fields (flattened)
  parking_available?: boolean | null;
  parking_accessible?: boolean | null;
  parking_notes?: string | null;

  // Amenities fields (flattened)
  amen_toilet?: boolean | null;
  amen_prayer_room?: boolean | null;

  // JSONB fields (can be string or already parsed object)
  contact?: string | { phone?: string; email?: string } | null;
  location?: string | { latitude: number; longitude: number; gmaps_link: string } | null;
  schedule?: string | MarketSchedule[] | null;
}
