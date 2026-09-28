/**
 * Shared utility for transforming D1 database rows to Market objects.
 * This avoids code duplication across client and server components.
 */

import type { Market, MarketSchedule } from "./market-types";
import type { MarketFormValues } from "@/lib/admin-schema";

/**
 * Database row structure from D1
 * Represents the flattened schema where nested objects are stored as JSON text
 * and related data is denormalized across columns.
 */
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

  // JSON columns (can be string or already parsed object)
  location?: string | { latitude: number; longitude: number; gmaps_link: string } | null;
  schedule?: string | MarketSchedule[] | null;
}

/**
 * Transform a database row to a Market object
 * Handles JSON parsing (both string and object formats)
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

    // Reconstruct parking object (D1 stores booleans as 0/1 integers)
    parking: {
      available: Boolean(row.parking_available),
      accessible: Boolean(row.parking_accessible),
      notes: row.parking_notes || "",
    },

    // Reconstruct amenities object
    amenities: {
      toilet: Boolean(row.amen_toilet),
      prayer_room: Boolean(row.amen_prayer_room),
    },

    // JSON columns may arrive as objects or strings depending on the driver
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

/**
 * Transform MarketFormValues into a D1 DB row object
 */
export function marketFormToDbRow(data: MarketFormValues, existingId?: string) {
  const id =
    existingId ??
    `${data.state}-${data.district}-${data.name}`
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  return {
    id,
    name: data.name,
    address: data.address,
    district: data.district,
    state: data.state,
    status: data.status,
    description: data.description ?? null,
    area_m2: data.area_m2 ?? null,
    total_shop: data.total_shop ?? null,
    shop_list: data.shop_list ?? null,
    amen_toilet: data.amenities.toilet,
    amen_prayer_room: data.amenities.prayer_room,
    parking_available: data.parking.available,
    parking_accessible: data.parking.accessible,
    parking_notes: data.parking.notes,
    location: data.location
      ? {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          gmaps_link: data.location.gmaps_link ?? "",
        }
      : null,
    schedule: data.schedule,
  };
}
