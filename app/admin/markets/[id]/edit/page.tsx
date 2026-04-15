import { notFound } from "next/navigation";
import { getMarketById, getAllStates } from "@/lib/db";
import { EditMarketClient } from "./edit-market-client";
import type { MarketFormValues } from "@/lib/admin-schema";
import type { Market } from "@/lib/markets-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

function marketToFormValues(market: Market): MarketFormValues {
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
    schedule:
      market.schedule.length > 0
        ? market.schedule
        : [{ days: [], times: [{ start: "17:00", end: "22:00", note: "" }] }],
    amenities: {
      toilet: market.amenities.toilet,
      prayer_room: market.amenities.prayer_room,
    },
    parking: {
      available: market.parking.available,
      accessible: market.parking.accessible,
      notes: market.parking.notes,
    },
    location: market.location
      ? {
          latitude: market.location.latitude,
          longitude: market.location.longitude,
          gmaps_link: market.location.gmaps_link ?? "",
        }
      : { latitude: 0, longitude: 0, gmaps_link: "" },
    contact: {
      phone: market.contact?.phone ?? "",
      email: market.contact?.email ?? "",
    },
  };
}

export default async function EditMarketPage({ params }: PageProps) {
  const { id } = await params;
  const [market, states] = await Promise.all([getMarketById(id), getAllStates()]);

  if (!market) notFound();

  const defaultValues = marketToFormValues(market);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Market</h1>
      <EditMarketClient id={id} defaultValues={defaultValues} states={states} />
    </div>
  );
}
