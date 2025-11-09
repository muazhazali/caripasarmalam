/**
 * Shared utility for transforming Supabase database rows to Market objects
 * This avoids code duplication across client and server components
 */

import type { Market } from "./markets-data";

/**
 * Transform a database row to a Market object
 * Handles JSONB parsing (both string and object formats)
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
export function dbRowsToMarkets(rows: any[]): Market[] {
  return rows.map(dbRowToMarket);
}
