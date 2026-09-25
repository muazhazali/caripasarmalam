import { getMarkets } from "@/lib/db";
import { apiError, cacheHeaders, checkRateLimit, json, preflight } from "@/lib/api";

export const runtime = "nodejs";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 100;

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request) {
  const { limited, headers: rateHeaders } = await checkRateLimit(request, "api:markets", 60, 60 * 1000);
  if (limited) {
    return apiError(429, "rate_limited", "Too many requests. Please retry later.", { "Retry-After": "60" });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? undefined;
  const district = url.searchParams.get("district") ?? undefined;
  const day = url.searchParams.get("day") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const status = url.searchParams.get("status") ?? "Active";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);

  const amenToilet = url.searchParams.get("amen_toilet");
  const amenPrayerRoom = url.searchParams.get("amen_prayer_room");
  const parkingAvailable = url.searchParams.get("parking_available");
  const parkingAccessible = url.searchParams.get("parking_accessible");

  try {
    const markets = await getMarkets({
      state,
      district,
      day: day as never,
      q,
      status,
      amen_toilet: amenToilet === null ? undefined : amenToilet === "true",
      amen_prayer_room: amenPrayerRoom === null ? undefined : amenPrayerRoom === "true",
      parking_available: parkingAvailable === null ? undefined : parkingAvailable === "true",
      parking_accessible: parkingAccessible === null ? undefined : parkingAccessible === "true",
      limit,
      offset,
    });

    return json(
      { data: markets, meta: { count: markets.length, limit, offset } },
      { headers: { ...cacheHeaders(60, 300), ...rateHeaders } },
    );
  } catch (e) {
    console.error("API /markets error:", e);
    return apiError(500, "internal_error", "Failed to fetch markets.");
  }
}