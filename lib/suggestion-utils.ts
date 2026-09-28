import type { Market } from "@/lib/market-types";
import type { MarketFormValues } from "@/lib/admin-schema";
import type { Seller } from "@/lib/seller-types";
import type { SellerFormValues } from "@/lib/seller-schema";

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

/**
 * Convert a Seller object back into SellerFormValues shape for prefilling
 * the seller form (admin edit and update suggestions).
 */
export function sellerToFormValues(seller: Seller): SellerFormValues {
  return {
    name: seller.name,
    category: seller.category ?? "",
    description: seller.description ?? "",
    phone: seller.phone ?? "",
    social: seller.social.map((s) => ({ platform: s.platform, url: s.url })),
    status: seller.status,
    items: (seller.items ?? []).map((i) => ({
      name: i.name,
      price: i.price ?? null,
      note: i.note ?? "",
    })),
    locations: (seller.locations ?? []).map((l) => ({
      market_id: l.market_id,
      days: l.days,
      stall: l.stall ?? "",
      notes: l.notes ?? "",
    })),
  };
}
