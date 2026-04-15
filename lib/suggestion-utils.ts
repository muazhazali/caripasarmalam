import type { Market } from "@/lib/markets-data";
import type { MarketFormValues } from "@/lib/admin-schema";

/**
 * Convert a Market object back into MarketFormValues shape for prefilling
 * the suggestion form when updating an existing market.
 */
export function marketToFormValues(market: Market): MarketFormValues {
  return {
    name: market.name,
    address: market.address,
    district: market.district,
    state: market.state,
    status: market.status as MarketFormValues["status"],
    description: market.description ?? "",
    area_m2: market.area_m2 ?? undefined,
    total_shop: market.total_shop ?? undefined,
    shop_list: market.shop_list?.join(", ") ?? "",
    location: market.location
      ? {
          latitude: market.location.latitude,
          longitude: market.location.longitude,
          gmaps_link: market.location.gmaps_link ?? "",
        }
      : undefined,
    schedule: market.schedule.map((s) => ({
      days: s.days,
      times: s.times.map((t) => ({
        start: t.start,
        end: t.end,
        note: t.note ?? "",
      })),
    })),
    contact: market.contact
      ? {
          phone: market.contact.phone ?? "",
          email: market.contact.email ?? "",
        }
      : undefined,
    amenities: {
      toilet: market.amenities.toilet,
      prayer_room: market.amenities.prayer_room,
    },
    parking: {
      available: market.parking.available,
      accessible: market.parking.accessible,
      notes: market.parking.notes,
    },
  };
}
